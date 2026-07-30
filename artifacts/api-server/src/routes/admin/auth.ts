import { Router } from "express";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ ok: false, error: "Username and password required" });
    return;
  }

  const validUser = process.env.ADMIN_USERNAME || "admin";
  const validPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username !== validUser || password !== validPass) {
    res.status(401).json({ ok: false, error: "Invalid credentials" });
    return;
  }

  req.session.adminUsername = validUser;
  req.session.adminName = "Administrator";
  res.json({ ok: true, user: { username: validUser, name: "Administrator" } });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get("/session", requireAdmin, (req, res) => {
  res.json({ ok: true, user: { username: req.session.adminUsername, name: req.session.adminName } });
});

router.put("/password", requireAdmin, async (req, res) => {
  res.status(400).json({ 
    ok: false, 
    error: "Vercel rejimida parolni o'zgartirish o'chirilgan. Parolni Vercel Environment Variables orqali o'zgartiring." 
  });
});

export default router;