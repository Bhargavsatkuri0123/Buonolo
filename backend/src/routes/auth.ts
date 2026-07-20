import { Router } from "express";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db.js";
import { asyncHandler, HttpError } from "../middleware/errorHandler.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { hashPassword, comparePassword } from "../lib/password.js";
import {
  clearLoginAttempts,
  issueRefreshToken,
  registerLoginAttempt,
  revokeRefreshToken,
  signAccessToken,
  verifyRefreshToken,
} from "../lib/tokens.js";
import { clearRefreshCookie, getRefreshCookie, setRefreshCookie } from "../lib/cookies.js";
import { generateUniqueHandle } from "../lib/handle.js";
import { loadProfile } from "../lib/serialize.js";
import { env } from "../env.js";

export const authRouter = Router();

const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(120),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { email, password, fullName } = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "An account with this email already exists");

    const [passwordHash, handle] = await Promise.all([hashPassword(password), generateUniqueHandle(fullName)]);
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, handle },
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ accessToken, refreshToken, profile: await loadProfile(user.id) });
  })
);

const googleSchema = z.object({ idToken: z.string() });

authRouter.post(
  "/google",
  asyncHandler(async (req, res) => {
    if (!googleClient) throw new HttpError(500, "Google sign-in is not configured");
    const { idToken } = googleSchema.parse(req.body);

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken, audience: env.googleClientId! });
      payload = ticket.getPayload();
    } catch {
      throw new HttpError(401, "Invalid Google credential");
    }
    if (!payload?.email || !payload.email_verified) throw new HttpError(401, "Invalid Google credential");

    let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
    let isNewUser = false;

    if (!user) {
      // An existing email/password account with this email links to Google rather than colliding.
      const existingByEmail = await prisma.user.findUnique({ where: { email: payload.email } });
      if (existingByEmail) {
        user = await prisma.user.update({ where: { id: existingByEmail.id }, data: { googleId: payload.sub } });
      } else {
        const handle = await generateUniqueHandle(payload.name ?? payload.email);
        user = await prisma.user.create({
          data: { email: payload.email, googleId: payload.sub, fullName: payload.name ?? payload.email, handle },
        });
        isNewUser = true;
      }
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.status(isNewUser ? 201 : 200).json({ accessToken, refreshToken, profile: await loadProfile(user.id), isNewUser });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const attemptKey = `${email.toLowerCase()}:${req.ip}`;
    const { allowed } = await registerLoginAttempt(attemptKey);
    if (!allowed) throw new HttpError(429, "Too many login attempts. Try again later.");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !(await comparePassword(password, user.passwordHash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    await clearLoginAttempts(attemptKey);

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, refreshToken);

    res.json({ accessToken, refreshToken, profile: await loadProfile(user.id) });
  })
);

const refreshSchema = z.object({ refreshToken: z.string().optional() });

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken: bodyToken } = refreshSchema.parse(req.body ?? {});
    const token = getRefreshCookie(req.cookies ?? {}) ?? bodyToken;
    if (!token) throw new HttpError(401, "Missing refresh token");

    let userId: string;
    let jti: string;
    try {
      ({ userId, jti } = await verifyRefreshToken(token));
    } catch {
      throw new HttpError(401, "Invalid or expired refresh token");
    }

    // Rotate: revoke the old token and issue a new one, so a stolen refresh token can't be replayed indefinitely.
    await revokeRefreshToken(jti);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(401, "User no longer exists");

    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const newRefreshToken = await issueRefreshToken(user.id);
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken, refreshToken: newRefreshToken });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = getRefreshCookie(req.cookies ?? {}) ?? req.body?.refreshToken;
    if (token) {
      try {
        const { jti } = await verifyRefreshToken(token);
        await revokeRefreshToken(jti);
      } catch {
        // token already invalid/expired — nothing to revoke
      }
    }
    clearRefreshCookie(res);
    res.status(204).end();
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const profile = await loadProfile(req.userId!);
    if (!profile) throw new HttpError(404, "User not found");
    res.json({ profile });
  })
);
