import admin from "firebase-admin";
import fs from "fs";
import path from "path";

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
  console.error(">>> [FIREBASE ERROR] FIREBASE_SERVICE_ACCOUNT environment variable is not defined!");
}

// Fix escaped newlines in private_key for OpenSSL/crypto compatibility
if (serviceAccount && typeof serviceAccount === "object" && typeof serviceAccount.private_key === "string") {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

const databaseURL = process.env.FIREBASE_DATABASE_URL;
if (!databaseURL) {
  console.error(">>> [FIREBASE ERROR] FIREBASE_DATABASE_URL environment variable is not defined!");
}

if (serviceAccount && databaseURL) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL,
      });
    }
    console.log(">>> FIREBASE INITIALIZED SUCCESSFULLY ON DATABASE:", databaseURL);
  } catch (err: unknown) {
    console.error(">>> [FIREBASE ERROR] Firebase initializeApp failed:", err);
  }
} else {
  console.error(
    ">>> [FIREBASE ERROR] Firebase NOT initialized: " +
    `serviceAccount=${serviceAccount ? "VALID" : "MISSING/INVALID"}, ` +
    `databaseURL=${databaseURL ? databaseURL : "MISSING"}`
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
      // Continue to next path
    }
  }
  return null;
}

export async function readData<T>(filename: string, defaultValue: T): Promise<T> {
  const refName = filename.replace(/\.json$/, "");

  if (db) {
    try {
      const snapshot = await db.ref(refName).once("value");
      if (snapshot.exists()) {
        const val = snapshot.val();
        return val as T;
      }

      // If data does not exist in Firebase yet, seed it from local seed files
      const localSeed = getLocalData<T>(filename);
      const initialData = localSeed !== null ? localSeed : defaultValue;

      try {
        await db.ref(refName).set(initialData);
        console.log(`>>> [FIREBASE] Seeded initial data for '${refName}' into Realtime Database`);
      } catch (seedErr) {
        console.error(`>>> [FIREBASE ERROR] Failed to seed initial data for '${refName}':`, seedErr);
      }

      return initialData;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to read '${refName}' from Firebase:`, error);
      throw error;
    }
  }

  console.error(
    `>>> [FIREBASE CRITICAL ERROR] Cannot read '${refName}': Firebase Realtime Database is NOT initialized! ` +
    `Check FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL in Vercel settings.`
  );

  const localData = getLocalData<T>(filename);
  if (localData !== null) return localData;
  return defaultValue;
}

export async function writeData<T>(filename: string, data: T): Promise<void> {
  const refName = filename.replace(/\.json$/, "");

  if (db) {
    try {
      await db.ref(refName).set(data);
      console.log(`>>> [FIREBASE] Successfully persisted '${refName}' to Firebase Realtime Database`);
      return;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to write '${refName}' to Firebase Realtime Database:`, error);
      throw error;
    }
  }

  console.error(
    `>>> [FIREBASE CRITICAL ERROR] Cannot persist '${refName}': Firebase Realtime Database is NOT initialized! ` +
    `Data was NOT persisted. Check FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL in Vercel settings.`
  );
  throw new Error(`Firebase not initialized. Cannot persist ${refName}`);
}

export const getData = readData;
export const setData = writeData;

export async function updateData<T extends Record<string, any>>(filename: string, updates: Partial<T>): Promise<void> {
  const refName = filename.replace(/\.json$/, "");

  if (db) {
    try {
      await db.ref(refName).update(updates);
      console.log(`>>> [FIREBASE] Successfully updated '${refName}' in Firebase Realtime Database`);
      return;
    } catch (error: unknown) {
      console.error(`>>> [FIREBASE ERROR] Failed to update '${refName}' in Firebase Realtime Database:`, error);
      throw error;
    }
  }

  console.error(`>>> [FIREBASE CRITICAL ERROR] Cannot update '${refName}': Firebase is NOT initialized!`);
  throw new Error(`Firebase not initialized. Cannot update ${refName}`);
}

export async function initializeData(): Promise<void> {
  if (db) {
    console.log(">>> [FIREBASE] Realtime Database connection ready for requests.");
  } else {
    console.error(
      ">>> [FIREBASE CRITICAL ERROR] Firebase is NOT initialized! " +
      "Ensure FIREBASE_SERVICE_ACCOUNT and FIREBASE_DATABASE_URL are correctly set in Vercel Environment Variables."
    );
  }
}

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function ensureDirs(): Promise<void> {
  // Not needed in Firebase mode
}
