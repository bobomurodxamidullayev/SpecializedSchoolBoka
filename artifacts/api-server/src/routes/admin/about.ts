import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "about.json";

// requireAdmin olib tashlandi - endi oddiy foydalanuvchilar ham ko'ra oladi
router.get("/", async (_req, res) => {
  const data = await readData(FILE, {});
  res.json({ ok: true, data });
});

// requireAdmin joyida qoldi - faqat admin tahrirlay oladi
router.put("/", requireAdmin, async (req, res) => {
  await writeData(FILE, req.body);
  res.json({ ok: true, data: req.body });
});

export default router;