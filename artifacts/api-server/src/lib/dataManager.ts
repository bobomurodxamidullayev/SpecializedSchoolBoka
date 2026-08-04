import { logger } from "./logger.js";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let serviceAccountKey: any = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const rawEnv = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (rawEnv.startsWith("{")) {
      serviceAccountKey = JSON.parse(rawEnv);
    } else {
      const decoded = Buffer.from(rawEnv, "base64").toString("utf-8");
      const cleanJson = decoded.replace(/\\n/g, "\\n");
      serviceAccountKey = JSON.parse(cleanJson);
    }
  } catch (err: unknown) {
    logger.error({ err }, "FIREBASE_SERVICE_ACCOUNT JSON parsing xatosi:");
    serviceAccountKey = null;
  }
}

if (serviceAccountKey && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountKey),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    logger.info("Firebase Realtime Database ulandi");
  } catch (err: unknown) {
    logger.error({ err }, "Firebase initializeApp xatosi:");
  }
} else if (!serviceAccountKey) {
  logger.info("Firebase sozlanmagan. Mahalliy / xotira rejimi ishlatiladi.");
}

const db = admin.apps.length ? admin.database() : null;

// Xotira keshlanishi (Vercel-da disk xatosini oldini olish uchun)
const memoryStore: Record<string, any> = {};

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDirSafe(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch (err: unknown) {
    // Vercel serverless muhitida diskka yozib bo'lmaydi
    return false;
  }
}

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  if (db) {
    try {
      const refName = filename.replace(".json", "");
      const snapshot = await db.ref(refName).once("value");
      if (snapshot.exists()) return snapshot.val() as T;
      return defaultValue;
    } catch (error: unknown) {
      logger.error({ err: error }, `Firebase o'qishda xato: ${filename}`);
    }
  }

  // Xotiradan o'qish
  if (memoryStore[filename] !== undefined) {
    return memoryStore[filename] as T;
  }

  // Diskdan o'qish (agar iloj bo'lsa)
  try {
    if (ensureDataDirSafe()) {
      const filePath = path.join(DATA_DIR, filename);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw) as T;
        memoryStore[filename] = parsed;
        return parsed;
      }
    }
  } catch (error: unknown) {
    logger.error({ err: error }, `Fayl o'qishda xato: ${filename}`);
  }

  return defaultValue;
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  // Har doim birinchi xotirada saqlab turamiz
  memoryStore[filename] = data;

  if (db) {
    try {
      const refName = filename.replace(".json", "");
      await db.ref(refName).set(data);
      return;
    } catch (error: unknown) {
      logger.error({ err: error }, `Firebase yozishda xato: ${filename}`);
    }
  }

  // Diskka saqlashga urinib ko'ramiz (serverless-da xato bersa ham to'xtamaydi)
  try {
    if (ensureDataDirSafe()) {
      const filePath = path.join(DATA_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (error: unknown) {
    logger.warn(`Diskka yozib bo'lmadi (Vercel Read-Only): ${filename}`);
  }
}

export async function initializeData(): Promise<void> {
  logger.info("Ma'lumotlar tizimi tayyor.");
}

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function ensureDirs(): Promise<void> {
  ensureDataDirSafe();
}