import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "english-certs.json";

const DEFAULT_DATA = {
  levels: [
    { level: "B1", count: 216 },
    { level: "B2", count: 63 },
    { level: "C1", count: 0 },
  ],
  growthData: [
    { year: "2021", count: 3 },
    { year: "2022", count: 60 },
    { year: "2023", count: 131 },
    { year: "2024", count: 192 },
    { year: "2025", count: 252 },
  ],
};

router.get("/", requireAdmin, async (_req, res) => {
  const data = await readData(FILE, DEFAULT_DATA);
  res.json({ ok: true, data });
});

router.put("/", requireAdmin, async (req, res) => {
  const current = await readData(FILE, DEFAULT_DATA);
  const updated = { ...current, ...req.body };
  await writeData(FILE, updated);
  res.json({ ok: true, data: updated });
});

export default router;
