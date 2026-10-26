import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// In-memory store fallback so API NEVER crashes even if Firebase has a temporary network hiccup
const memoryStore: Record<string, any> = {};

let serviceAccount: any = null;
const rawCreds = process.env.FIREBASE_SERVICE_ACCOUNT;

if (rawCreds) {
  const trimmed = typeof rawCreds === "string" ? rawCreds.trim() : "";
  try {
    serviceAccount = typeof rawCreds === "object" ? rawCreds : JSON.parse(trimmed);
  } catch (e1) {
    try {
      // Handle escaped newlines in private_key or JSON string
      serviceAccount = JSON.parse(trimmed.replace(/\\n/g, "\n"));
    } catch (e2) {
      try {
        // Handle base64 encoded string
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
        try {
          serviceAccount = JSON.parse(decoded);
        } catch {
          serviceAccount = JSON.parse(decoded.replace(/\\n/g, "\n"));
        }
      } catch (e3) {
        console.error(">>> [FIREBASE ERROR] Failed to parse FIREBASE_SERVICE_ACCOUNT:", e2);
      }
    }
  }
} else {
  console.warn(">>> [FIREBASE WARNING] FIREBASE_SERVICE_ACCOUNT environment variable is not defined!");
}

// Fix escaped newlines in private_key for OpenSSL/crypto compatibility
if (serviceAccount && typeof serviceAccount === "object" && typeof serviceAccount.private_key === "string") {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  console.warn(">>> [FIREBASE WARNING] FIREBASE_DATABASE_URL environment variable is not defined!");
}

// Firebase Singleton Initialization across serverless lambda invocations
if (serviceAccount && databaseURL) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      });
      console.log(">>> FIREBASE INITIALIZED SUCCESSFULLY ON DATABASE:", databaseURL);
    }
  } catch (err: unknown) {
    console.error(">>> [FIREBASE ERROR] Firebase initializeApp failed:", err);
  }
} else {
  console.warn(
    ">>> [FIREBASE WARNING] Firebase credentials missing: " +
    `serviceAccount=${serviceAccount ? "PRESENT" : "MISSING"}, ` +
    `databaseURL=${databaseURL ? databaseURL : "MISSING"}. ` +
    "Running with in-memory fallback."
  );
}

export const db = admin.apps.length ? admin.database() : null;

const DATA_DIR = path.join(process.cwd(), "data");

function getLocalData<T>(filename: string): T | null {
  const possiblePaths = [
    path.join(process.cwd(), "data", filename),
    path.join(process.cwd(), "artifacts", "api-server", "data", filename),
    path.join(DATA_DIR, filename),
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, "utf-8");
        return JSON.parse(raw) as T;
      }
    } catch {
      // Continue searching
    }
  }
  return null;
}

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  const refName = filename.replace(/\.json$/, "");

  // 1. Try Firebase Realtime Database
  if (db) {
    try {
      const snapshot = await db.ref(refName).once("value");
      if (snapshot.exists()) {
        const val = snapshot.val();
        memoryStore[filename] = val;
        return val as T;
      }

      // If data does not exist in Firebase yet, seed it from local seed files
      const localSeed = getLocalData<T>(filename);
      const initialData = localSeed !== null ? localSeed : defaultValue;
      memoryStore[filename] = initialData;

      try {
        await db.ref(refName).set(initialData);
        console.log(`>>> [FIREBASE] Seeded initial data for '${refName}' into Realtime Database`);
      } catch (seedErr) {
        console.error(`>>> [FIREBASE ERROR] Failed to seed initial data for '${refName}':`, seedErr);
      }

      return initialData;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to read '${refName}' from Firebase:`, error);
      // Fall through to memoryStore/local file without crashing
    }
  }

  // 2. Fallback to memoryStore
  if (memoryStore[filename] !== undefined) {
    return memoryStore[filename] as T;
  }

  // 3. Fallback to local disk file
  const localData = getLocalData<T>(filename);
  if (localData !== null) {
    memoryStore[filename] = localData;
    return localData;
  }

  return defaultValue;
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  const refName = filename.replace(/\.json$/, "");

  // Always keep in memory so reads within this worker immediately see the update
  memoryStore[filename] = data;

  // Persist to Firebase Realtime Database
  if (db) {
    try {
      await db.ref(refName).set(data);
      console.log(`>>> [FIREBASE] Successfully persisted '${refName}' to Firebase Realtime Database`);
      return;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to write '${refName}' to Firebase Realtime Database:`, error);
      // DO NOT CRASH: memoryStore has the data, return smoothly
      return;
    }
  } else {
    console.warn(`>>> [FIREBASE WARNING] writeData for '${refName}' saved to memory (Firebase not connected).`);
  }

  // Try local disk backup if writable (e.g. local dev)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Read-only filesystem on Vercel serverless; safely ignore
  }
}

export const getData = readData;
export const setData = writeData;

export async function updateData<T extends Record<string, any>>(filename: string, updates: Partial<T>): Promise<void> {
  const refName = filename.replace(/\.json$/, "");

  if (memoryStore[filename] && typeof memoryStore[filename] === "object") {
    memoryStore[filename] = { ...memoryStore[filename], ...updates };
  }

  if (db) {
    try {
      await db.ref(refName).update(updates);
      console.log(`>>> [FIREBASE] Successfully updated '${refName}' in Firebase Realtime Database`);
      return;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to update '${refName}' in Firebase Realtime Database:`, error);
      return;
    }
  }
}

export async function initializeData(): Promise<void> {
  if (db) {
    console.log(">>> [FIREBASE] Realtime Database connection ready for requests.");
  } else {
    console.warn(">>> [FIREBASE WARNING] Running with memory/local data fallback.");
  }
}

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function ensureDirs(): Promise<void> {}
