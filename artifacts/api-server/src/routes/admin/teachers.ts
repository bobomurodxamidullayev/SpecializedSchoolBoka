import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "teachers.json";

router.get("/", requireAdmin, async (req, res) => {
  const data = await readData(FILE, []);
  res.json({ ok: true, data });
});

router.post("/", requireAdmin, async (req, res) => {
  const items = await readData<Record<string, unknown>[]>(FILE, []);
  const item = { id: crypto.randomUUID(), ...req.body };
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
