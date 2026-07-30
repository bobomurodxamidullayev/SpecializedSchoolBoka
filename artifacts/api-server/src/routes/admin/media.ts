import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "media.json";

router.get("/", requireAdmin, async (req, res) => {
  try {
    let data = await readData<Record<string, any>[]>(FILE, []);
    data = Array.isArray(data) ? data : Object.values(data || {});

    // Yangilari birinchi chiqishi uchun saralash
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ ok: true, data });
  } catch (err) {
    res.json({ ok: true, data: [] });
  }
});

router.delete("/:filename", requireAdmin, async (req, res) => {
  try {
    let data = await readData<Record<string, any>[]>(FILE, []);
    data = Array.isArray(data) ? data : Object.values(data || {});

    // O'chirilgan rasmni ro'yxatdan olib tashlash
    const newData = data.filter((item) => item.filename !== req.params.filename);
    await writeData(FILE, newData);

    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ ok: false, error: "Rasm topilmadi" });
  }
});

export default router;