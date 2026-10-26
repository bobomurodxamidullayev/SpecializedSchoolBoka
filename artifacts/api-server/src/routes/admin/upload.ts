import { Router, type Request, type Response } from "express";
import multer from "multer";
import crypto from "crypto";
import { readData, writeData } from "../../lib/dataManager.js";
import { requireAdmin } from "../../middlewares/requireAdmin.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
});

const router = Router();

interface MediaItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

async function uploadSingleBuffer(file: Express.Multer.File): Promise<MediaItem> {
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const apiKey = process.env["IMGBB_API_KEY"];
  const albumId = process.env["IMGBB_ALBUM_ID"];
  let url = "";

  if (apiKey) {
    try {
      const base64Image = file.buffer.toString("base64");
      const form = new URLSearchParams();
      form.append("key", apiKey);
      form.append("image", base64Image);
      if (albumId) {
        form.append("album", albumId);
      }

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: form,
      });

      const result = (await response.json()) as any;
      if (result && result.success && result.data?.url) {
        url = result.data.url;
      } else {
        console.warn("ImgBB returned error:", result?.error?.message);
      }
    } catch (err) {
      console.warn("ImgBB upload failed, falling back:", err);
    }
  }

  // Fallback to data URI if ImgBB not configured or failed
  if (!url) {
    const mime = file.mimetype || "image/jpeg";
    url = `data:${mime};base64,${file.buffer.toString("base64")}`;
  }

  return {
    filename: name,
    url,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
}

async function saveMediaToDb(items: MediaItem[]): Promise<void> {
  try {
    let mediaList = await readData<Record<string, any>[]>("media.json", []);
    mediaList = Array.isArray(mediaList) ? mediaList : Object.values(mediaList || {});
    mediaList.push(...items);
    await writeData("media.json", mediaList);
  } catch (dbErr) {
    console.warn("Media bazaga yozilmadi (baza xatosi):", dbErr);
  }
}

// Single file upload endpoint: POST /
router.post("/", requireAdmin, upload.any(), async (req: Request, res: Response) => {
  const files = (req.files && Array.isArray(req.files) && req.files.length > 0)
    ? (req.files as Express.Multer.File[])
    : ((req as any).file ? [(req as any).file as Express.Multer.File] : []);

  if (files.length === 0) {
    res.status(400).json({ ok: false, error: "Fayl yuklanmadi" });
    return;
  }

  try {
    const uploaded = await uploadSingleBuffer(files[0]);
    await saveMediaToDb([uploaded]);
    res.json({ ok: true, data: uploaded });
  } catch (err: any) {
    console.error("Rasm yuklashda xato:", err);
    res.status(500).json({ ok: false, error: err?.message || "Serverga rasm yuklashda xatolik yuz berdi" });
  }
});

// Multiple files upload endpoint: POST /multiple
router.post("/multiple", requireAdmin, upload.any(), async (req: Request, res: Response) => {
  const files = (req.files && Array.isArray(req.files) && req.files.length > 0)
    ? (req.files as Express.Multer.File[])
    : ((req as any).file ? [(req as any).file as Express.Multer.File] : []);

  if (files.length === 0) {
    res.status(400).json({ ok: false, error: "Fayllar yuklanmadi" });
    return;
  }

  try {
    const uploadedList: MediaItem[] = [];
    for (const file of files) {
      const item = await uploadSingleBuffer(file);
      uploadedList.push(item);
    }
    await saveMediaToDb(uploadedList);
    res.json({ ok: true, data: uploadedList });
  } catch (err: any) {
    console.error("Ko'p rasm yuklashda xato:", err);
    res.status(500).json({ ok: false, error: err?.message || "Serverga rasmlar yuklashda xatolik yuz berdi" });
  }
});

export default router;
