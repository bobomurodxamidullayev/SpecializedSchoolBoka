import { logger } from "./logger.js";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString())
  : null;

if (serviceAccountKey && !admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  logger.info("Firebase Realtime Database ulandi");
} else if (!serviceAccountKey) {
  logger.info("Firebase sozlanmagan. Mahalliy fayl tizimi ishlatiladi.");
}

const db = admin.apps.length ? admin.database() : null;

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  if (db) {
    try {
      const refName = filename.replace(".json", "");
      const snapshot = await db.ref(refName).once("value");
      if (snapshot.exists()) return snapshot.val() as T;
      return defaultValue;
    } catch (error) {
      logger.error(`Firebase o'qishda xato: ${filename}`, error);
      return defaultValue;
    }
  }

  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    logger.error(`Fayl o'qishda xato: ${filename}`, error);
    return defaultValue;
  }
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  if (db) {
    try {
      const refName = filename.replace(".json", "");
      await db.ref(refName).set(data);
      return;
    } catch (error) {
      logger.error(`Firebase yozishda xato: ${filename}`, error);
      throw error;
    }
  }

  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    logger.error(`Fayl yozishda xato: ${filename}`, error);
    throw error;
  }
}

export async function initializeData(): Promise<void> {
  logger.info("Ma'lumotlar tizimi tayyor.");
}

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function ensureDirs(): Promise<void> {
  ensureDataDir();
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
