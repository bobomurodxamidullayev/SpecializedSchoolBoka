import { Router } from "express";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

// Odatiy bo'sh strukturamiz (Frontend .length yoki .map ishlatganda crash bo'lmasligi uchun)
const defaultSettings = {
  schoolName: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  stats: [],
  features: [],
  gallery: [],
  socialLinks: {}
};

router.get("/", requireAdmin, async (req, res) => {
  try {
    const data = await readData<Record<string, any>>("settings.json", {});
    
    // Agar data bo'sh bo'lsa yoki ba'zi massivlar yo'q bo'lsa, default bilan birlashtiramiz
    const safeData = {
      ...defaultSettings,
      ...(data || {}),
      stats: data?.stats || [],
      features: data?.features || [],
      gallery: data?.gallery || []
    };

    res.json({ ok: true, data: safeData });
  } catch (error) {
    res.json({ ok: true, data: defaultSettings });
  }
});

router.put("/", requireAdmin, async (req, res) => {
  try {
    const current = await readData<Record<string, any>>("settings.json", {});
    const updated = { ...current, ...req.body };
    await writeData("settings.json", updated);
    res.json({ ok: true, data: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Sozlamalarni saqlashda xatolik" });
  }
});

export default router;