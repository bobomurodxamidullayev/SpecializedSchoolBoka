import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.adminUsername) {
    next();
  } else {
    res.status(401).json({ ok: false, error: "Unauthorized" });
  }
}