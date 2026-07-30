import { Router } from "express";
import { readData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  const [administration, teachers, news, gallery, students, certificates, admissions] = await Promise.all([
    readData<unknown[]>("administration.json", []),
    readData<unknown[]>("teachers.json", []),
    readData<Record<string, unknown>[]>("news.json", []),
    readData<Record<string, unknown>[]>("gallery.json", []),
    readData<unknown[]>("students.json", []),
    readData<unknown[]>("certificates.json", []),
    readData<unknown[]>("admissions.json", []),
  ]);

  const totalImages = gallery.reduce((sum, item) => sum + ((item["images"] as unknown[])?.length || 0), 0);
  const recentNews = news.slice(0, 5).map((n) => ({
    id: n["id"],
    title: n["title"],
    status: n["status"],
    publishDate: n["publishDate"],
    category: n["category"],
  }));

  res.json({
    ok: true,
    data: {
      stats: {
        administration: administration.length,
        teachers: teachers.length,
        news: news.length,
        gallery: totalImages,
        students: students.length,
        certificates: certificates.length,
        admissions: admissions.length,
      },
      recentNews,
    },
  });
});

export default router;
