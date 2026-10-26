import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/token.js";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  // 1. Session check (via cookie-session)
  if (req.session && req.session.adminUsername) {
    return next();
  }

  // 2. Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();
    const verified = verifyToken(token);
    if (verified) {
      if (req.session) {
        req.session.adminUsername = verified.username;
        req.session.adminName = "Administrator";
      }
      (req as any).adminUsername = verified.username;
      return next();
    }
  }

  // 3. X-Admin-Token header
  const customHeader = req.headers["x-admin-token"];
  if (typeof customHeader === "string") {
    const verified = verifyToken(customHeader.trim());
    if (verified) {
      if (req.session) {
        req.session.adminUsername = verified.username;
        req.session.adminName = "Administrator";
      }
      (req as any).adminUsername = verified.username;
      return next();
    }
  }

  // 4. Cookie check (admin_token)
  const cookieToken = req.cookies?.admin_token;
  if (typeof cookieToken === "string") {
    const verified = verifyToken(cookieToken);
    if (verified) {
      if (req.session) {
        req.session.adminUsername = verified.username;
        req.session.adminName = "Administrator";
      }
      (req as any).adminUsername = verified.username;
      return next();
    }
  }

  res.status(401).json({ ok: false, error: "Unauthorized" });
}
