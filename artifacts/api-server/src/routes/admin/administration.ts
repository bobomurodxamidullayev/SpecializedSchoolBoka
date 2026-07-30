import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import crypto from "crypto";

const router = Router();
const FILE = "administration.json";

router.get("/", requireAdmin, async (req, res) => {
  try {
    // Bazadagi ma'lumot array o'rniga object bo'lib qaytishi mumkin, shuni to'g'rilaymiz
    const data = await readData(FILE, []);
    const dataArray = Array.isArray(data) ? data : Object.values(data || {});
    res.json({ ok: true, data: dataArray });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Server Error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    let items = await readData<Record<string, unknown>[]>(FILE, []);
    items = Array.isArray(items) ? items : Object.values(items || {});

    const item = { 
      id: crypto.randomUUID(), 
      ...req.body,
      photo: req.body.photo || "" // Rasm hozircha matn ko'rinishida olinadi
    };

    items.push(item);
    await writeData(FILE, items);
    res.json({ ok: true, data: item });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Bazaga yozib bo'lmadi" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  let items = await readData<Record<string, unknown>[]>(FILE, []);
  items = Array.isArray(items) ? items : Object.values(items || {});

  const idx = items.findIndex((i) => i["id"] === req.params["id"]);
  if (idx === -1) { res.status(404).json({ ok: false, error: "Not found" }); return; }

  items[idx] = { ...items[idx], ...req.body, id: req.params["id"] };
  await writeData(FILE, items);
  res.json({ ok: true, data: items[idx] });
});

router.delete("/:id", requireAdmin, async (req, res) => {
  let items = await readData<Record<string, unknown>[]>(FILE, []);
  items = Array.isArray(items) ? items : Object.values(items || {});

  await writeData(FILE, items.filter((i) => i["id"] !== req.params["id"]));
  res.json({ ok: true });
});

export default router;