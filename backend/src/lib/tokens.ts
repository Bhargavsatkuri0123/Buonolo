import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { env } from "../env.js";
import { redis } from "../redis.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenTtl as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
}

const REFRESH_PREFIX = "refresh:";

// Refresh tokens are whitelisted in Redis (jti -> userId) so logout / rotation can revoke them immediately,
// rather than waiting out the JWT's own expiry.
export async function issueRefreshToken(userId: string): Promise<string> {
  const jti = uuid();
  const token = jwt.sign({ sub: userId, jti }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtlSeconds,
  });
  await redis.set(REFRESH_PREFIX + jti, userId, "EX", env.refreshTokenTtlSeconds);
  return token;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; jti: string }> {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as { sub: string; jti: string };
  const stored = await redis.get(REFRESH_PREFIX + decoded.jti);
  if (!stored || stored !== decoded.sub) throw new Error("Refresh token revoked or expired");
  return { userId: decoded.sub, jti: decoded.jti };
}

export async function revokeRefreshToken(jti: string): Promise<void> {
  await redis.del(REFRESH_PREFIX + jti);
}

const LOGIN_ATTEMPT_PREFIX = "login-attempts:";
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export async function registerLoginAttempt(key: string): Promise<{ allowed: boolean; remaining: number }> {
  const redisKey = LOGIN_ATTEMPT_PREFIX + key;
  const attempts = await redis.incr(redisKey);
  if (attempts === 1) await redis.expire(redisKey, LOGIN_ATTEMPT_WINDOW_SECONDS);
  return { allowed: attempts <= MAX_LOGIN_ATTEMPTS, remaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts) };
}

export async function clearLoginAttempts(key: string): Promise<void> {
  await redis.del(LOGIN_ATTEMPT_PREFIX + key);
}
