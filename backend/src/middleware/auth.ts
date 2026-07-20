import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/tokens.js";

// Params typed as plain string (Express's ParamsDictionary otherwise allows string[] for wildcard routes,
// which we don't use — every route here takes named `:id`-style params).
export interface AuthedRequest extends Request<Record<string, string>> {
  userId?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (!token) return res.status(401).json({ error: "Missing access token" });

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }
}

// Optional auth: attaches userId if a valid token is present, but doesn't reject the request otherwise.
// Used for routes like the public feed, where a logged-in viewer sees extra per-user fields (liked/saved/following).
export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
  if (token) {
    try {
      req.userId = verifyAccessToken(token).sub;
    } catch {
      // ignore invalid token, treat as anonymous
    }
  }
  next();
}
