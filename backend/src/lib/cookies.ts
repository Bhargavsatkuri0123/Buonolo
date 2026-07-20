import type { Response } from "express";
import { env } from "../env.js";

const REFRESH_COOKIE = "refreshToken";

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: env.refreshTokenTtlSeconds * 1000,
    path: "/api/auth",
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function getRefreshCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[REFRESH_COOKIE];
}
