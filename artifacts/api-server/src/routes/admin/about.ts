import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();
const FILE = "about.json";

// Default bo'sh struktura (Frontend crash bo'lmasligi uchun)
// IMPORTANT: All fields the frontend AdminAbout component reads MUST be present here
// so that even an empty/uninitialized about.json returns a fully-shaped object.
const DEFAULT_ABOUT = {
  // Fields used by the legacy public /about route
  title: { uz: "", en: "", ru: "" },
  description: { uz: "", en: "", ru: "" },
  content: { uz: "", en: "", ru: "" },
  heroTitle: { uz: "", en: "", ru: "" },
  heroSubtitle: { uz: "", en: "", ru: "" },
  features: [] as any[],
  stats: [] as any[],
  history: [] as any[],
  images: [] as any[],
  values: [] as any[],
  // Fields used by the AdminAbout frontend component
  mission: { uz: "", en: "", ru: "" },
  vision: { uz: "", en: "", ru: "" },
  philosophy: [] as any[],
  timeline: [] as any[],
};

// requireAdmin olib tashlandi - endi oddiy foydalanuvchilar ham ko'ra oladi
router.get("/", async (_req, res) => {
  try {
    const rawData = await readData<Record<string, any>>(FILE, {});
    const raw = rawData || {};

    // Spread defaults first so any key present in raw overwrites them,
    // then explicitly re-assert every array field so they are NEVER undefined
    // even when Firebase/disk returns a partial or legacy document.
    const safeData = {
      ...DEFAULT_ABOUT,
      ...raw,
      // Legacy array fields
      features:   Array.isArray(raw.features)   ? raw.features   : [],
      stats:      Array.isArray(raw.stats)       ? raw.stats       : [],
      history:    Array.isArray(raw.history)     ? raw.history     : [],
      images:     Array.isArray(raw.images)      ? raw.images      : [],
      values:     Array.isArray(raw.values)      ? raw.values      : [],
      // Admin-panel array fields — the primary crash source
      philosophy: Array.isArray(raw.philosophy)  ? raw.philosophy  : [],
      timeline:   Array.isArray(raw.timeline)    ? raw.timeline    : [],
      // LangObj fields — ensure they are objects, never undefined
      mission:    (raw.mission && typeof raw.mission === "object")   ? raw.mission   : DEFAULT_ABOUT.mission,
      vision:     (raw.vision  && typeof raw.vision  === "object")   ? raw.vision    : DEFAULT_ABOUT.vision,
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