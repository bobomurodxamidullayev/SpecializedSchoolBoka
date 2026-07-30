import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "faq.json";

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

router.patch("/reorder", requireAdmin, async (req, res) => {
  const { ids } = req.body as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) { res.status(400).json({ ok: false, error: "ids array required" }); return; }
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  const byId = new Map(items.map((i) => [i["id"] as string, i]));
  const reordered: Record<string, unknown>[] = [];
  ids.forEach((id, index) => { const item = byId.get(id); if (item) reordered.push({ ...item, order: index + 1 }); });
  for (const item of items) { if (!ids.includes(item["id"] as string)) reordered.push(item); }
  await writeData(FILE, reordered);
  res.json({ ok: true, data: reordered });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  await writeData(FILE, items.filter((i) => i["id"] !== req.params["id"]));
  res.json({ ok: true });
});

export default router;
