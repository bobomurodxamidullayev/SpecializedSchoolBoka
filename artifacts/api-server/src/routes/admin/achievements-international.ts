import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "achievements-international.json";

router.get("/", requireAdmin, async (_req, res) => {
  const data = await readData<Record<string, unknown>[]>(FILE, []);
  const sorted = [...data].sort((a, b) => ((a["order"] as number) || 0) - ((b["order"] as number) || 0));
  res.json({ ok: true, data: sorted });
});

router.post("/", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  const maxOrder = items.reduce((m, i) => Math.max(m, (i["order"] as number) || 0), 0);
  const item = { id: crypto.randomUUID(), order: maxOrder + 1, ...req.body };
  items.push(item);
  await writeData(FILE, items);
  res.json({ ok: true, data: item });
});

router.put("/:id", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  const idx = items.findIndex((i) => i["id"] === req.params["id"]);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Not found" }); return; }
  items[idx] = { ...items[idx], ...req.body, id: req.params["id"] };
  await writeData(FILE, items);
  res.json({ ok: true, data: items[idx] });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  await writeData(FILE, items.filter((i) => i["id"] !== req.params["id"]));
  res.json({ ok: true });
});

export default router;
