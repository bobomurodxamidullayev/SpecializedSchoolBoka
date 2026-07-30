import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const data = await readData("contact.json", {});
  res.json({ ok: true, data });
});

router.put("/", requireAdmin, async (req, res) => {
  const current = await readData("contact.json", {});
  const updated = { ...current, ...req.body };
  await writeData("contact.json", updated);
  res.json({ ok: true, data: updated });
});

export default router;
