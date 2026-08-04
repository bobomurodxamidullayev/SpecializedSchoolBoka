// @ts-nocheck
import { Router, type Request, type Response } from "express";
import multer from "multer";
import crypto from "crypto";
import { readData, writeData } from "../../lib/dataManager.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "Fayl yuklanmadi" });
    return;
  }

  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API kaliti topilmadi (IMGBB_API_KEY)");

    const albumId = process.env.IMGBB_ALBUM_ID;

    // ImgBB ga jo'natish uchun rasmni Base64 formatga o'tkazish
    const base64Image = req.file.buffer.toString("base64");

    // ImgBB API ga so'rov yuborish
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
    if (!result.success) {
      throw new Error(result.error?.message || "ImgBB rasmni qabul qilmadi");
    }

    const url = result.data.url;
    const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const newMedia = {
      filename: name,
      url: url,
      size: req.file.size,
      createdAt: new Date().toISOString()
    };

    // Firebase baza yoki media saqlashda xato bersa ham, ImgBB linkini qaytaramiz
    try {
      let mediaList = await readData<Record<string, any>[]>("media.json", []);
      mediaList = Array.isArray(mediaList) ? mediaList : Object.values(mediaList || {});
      mediaList.push(newMedia);
      await writeData("media.json", mediaList);
    } catch (dbErr) {
      console.warn("Media bazaga yozilmadi (baza xatosi):", dbErr);
    }

    res.json({ ok: true, data: newMedia });
  } catch (err: any) {
    console.error("Rasm yuklashda xato:", err);
    res.status(500).json({ ok: false, error: err?.message || "Serverga rasm yuklashda xatolik yuz berdi" });
  }
});

export default router;