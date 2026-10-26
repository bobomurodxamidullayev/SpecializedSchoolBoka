import { Router } from "express";
import crypto from "crypto";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "gallery.json";

interface GalleryItemRecord {
  id: string;
  images?: string[];
  [key: string]: any;
}

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const data = await readData<GalleryItemRecord[]>(FILE, []);
    const items: GalleryItemRecord[] = Array.isArray(data) ? data : Object.values(data || {});
    const normalized = items.map((item) => ({
      ...item,
      images: Array.isArray(item.images) ? item.images : [],
    }));
    res.json({ ok: true, data: normalized });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const rawData = await readData<GalleryItemRecord[]>(FILE, []);
    const items: GalleryItemRecord[] = Array.isArray(rawData) ? [...rawData] : Object.values(rawData || {});
    const id = (req.body && req.body.id) || crypto.randomUUID();
    const item: GalleryItemRecord = { id, images: [], ...req.body };
    items.push(item);
    await writeData(FILE, items);
    res.json({ ok: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const rawData = await readData<GalleryItemRecord[]>(FILE, []);
    const items: GalleryItemRecord[] = Array.isArray(rawData) ? [...rawData] : Object.values(rawData || {});
    const idx = items.findIndex((i) => i && i.id === req.params["id"]);
    if (idx === -1) {
      res.status(404).json({ ok: false, error: "Not found" });
      return;
    }
    items[idx] = { ...items[idx], ...req.body, id: req.params["id"] };
    await writeData(FILE, items);
    res.json({ ok: true, data: items[idx] });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const rawData = await readData<GalleryItemRecord[]>(FILE, []);
    const items: GalleryItemRecord[] = Array.isArray(rawData) ? [...rawData] : Object.values(rawData || {});
    const filtered = items.filter((i) => i && i.id !== req.params["id"]);
    await writeData(FILE, filtered);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
