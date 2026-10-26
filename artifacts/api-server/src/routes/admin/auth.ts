import { Router } from "express";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { generateToken } from "../../lib/token.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ ok: false, error: "Username and password required" });
    return;
  }

  const validUser = process.env["ADMIN_USERNAME"] || "admin";
  const validPass = process.env["ADMIN_PASSWORD"] || "admin123";

  if (username !== validUser || password !== validPass) {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
    return;
  }

  const token = generateToken(validUser);

  if (req.session) {
    req.session.adminUsername = validUser;
    req.session.adminName = "Administrator";
  }

  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.json({
    ok: true,
    token,
    user: { username: validUser, name: "Administrator" },
  });
});

router.post("/logout", (req, res) => {
  if (req.session && typeof (req.session as any).destroy === "function") {
    (req.session as any).destroy(() => {});
  } else if (req.session) {
    req.session = null;
  }
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.clearCookie("admin_session.sig", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.json({ ok: true });
});

router.get("/session", requireAdmin, (req, res) => {
  res.json({
    ok: true,
    user: {
      username: (req as any).adminUsername || req.session?.adminUsername || "admin",
      name: req.session?.adminName || "Administrator",
    },
  });
});

router.put("/password", requireAdmin, async (_req, res) => {
  res.status(400).json({
    ok: false,
    error: "Vercel rejimida parolni o'zgartirish o'chirilgan. Parolni Vercel Environment Variables orqali o'zgartiring.",
  });
});

export default router;
