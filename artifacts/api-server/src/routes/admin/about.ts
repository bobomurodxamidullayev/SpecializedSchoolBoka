import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "about.json";

// Default bo'sh struktura (Frontend crash bo'lmasligi uchun)
const DEFAULT_ABOUT = {
  title: { uz: "", en: "", ru: "" },
  description: { uz: "", en: "", ru: "" },
  content: { uz: "", en: "", ru: "" },
  heroTitle: { uz: "", en: "", ru: "" },
  heroSubtitle: { uz: "", en: "", ru: "" },
  features: [],
  stats: [],
  history: [],
  images: [],
  values: []
};

// requireAdmin olib tashlandi - endi oddiy foydalanuvchilar ham ko'ra oladi
router.get("/", async (_req, res) => {
  try {
    const rawData = await readData<Record<string, any>>(FILE, {});
    
    // Massivlar undefined bo'lib qolmasligini ta'minlaymiz
    const safeData = {
      ...DEFAULT_ABOUT,
      ...(rawData || {}),
      features: Array.isArray(rawData?.features) ? rawData.features : [],
      stats: Array.isArray(rawData?.stats) ? rawData.stats : [],
      history: Array.isArray(rawData?.history) ? rawData.history : [],
      images: Array.isArray(rawData?.images) ? rawData.images : [],
      values: Array.isArray(rawData?.values) ? rawData.values : []
    };

    res.json({ ok: true, data: safeData });
  } catch (error) {
    res.json({ ok: true, data: DEFAULT_ABOUT });
  }
});

// requireAdmin joyida qoldi - faqat admin tahrirlay oladi
router.put("/", requireAdmin, async (req, res) => {
  try {
    await writeData(FILE, req.body);
    res.json({ ok: true, data: req.body });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Ma'lumotni saqlashda xatolik yuz berdi" });
  }
});

export default router;