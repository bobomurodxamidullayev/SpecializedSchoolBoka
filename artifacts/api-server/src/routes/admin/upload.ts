import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { readData, writeData } from "../../lib/dataManager.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ ok: false, error: "Fayl yuklanmadi" });
    return;
  }

  try {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API kaliti topilmadi");

    // ImgBB ga jo'natish uchun rasmni Base64 formatga o'tkazish
    const base64Image = req.file.buffer.toString("base64");

    // ImgBB API ga so'rov yuborish
    const form = new URLSearchParams();
    form.append("key", apiKey);
    form.append("image", base64Image);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: form,
    });

    const result = await response.json();
    if (!result.success) throw new Error("ImgBB rasmni qabul qilmadi");

    const url = result.data.url;
    const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    // Rasm ma'lumotini Firebase bazamizdagi "media" ro'yxatiga yozib qo'yamiz
    let mediaList = await readData<Record<string, any>[]>("media.json", []);
    mediaList = Array.isArray(mediaList) ? mediaList : Object.values(mediaList || {});

    const newMedia = {
      filename: name,
      url: url,
      size: req.file.size,
      createdAt: new Date().toISOString()
    };

    mediaList.push(newMedia);
    await writeData("media.json", mediaList);

    res.json({ ok: true, data: newMedia });
  } catch (err) {
    console.error("Rasm yuklashda xato:", err);
    res.status(500).json({ ok: false, error: "Serverga rasm yuklashda xatolik yuz berdi" });
  }
});

export default router;