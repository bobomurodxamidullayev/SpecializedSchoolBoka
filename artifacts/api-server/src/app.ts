import express, { type Express } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import pinoHttpImport from "pino-http";
import path from "path";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { initializeData, UPLOADS_DIR } from "./lib/dataManager.js";

const pinoHttp = (pinoHttpImport as any).default || pinoHttpImport;

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res: any) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) {
      return callback(null, true);
    }
    // Allow all incoming origins (including boka-im.uz, www.boka-im.uz, localhost, vercel previews, etc.)
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);

// Enable CORS middleware for all incoming requests
app.use(corsMiddleware);

// Explicit preflight handling before any router or route handlers
try {
  app.options("*", corsMiddleware);
} catch {
  // Express 5 (path-to-regexp v8) wildcard syntax compatibility
  app.options("{*path}", corsMiddleware);
}
app.options(/.*/, corsMiddleware);

app.use(
  cookieSession({
    name: "admin_session",
    keys: [process.env["SESSION_SECRET"] || "qch-admin-secret-2024-x9k"],
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "none",
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/uploads", express.static(UPLOADS_DIR));

app.use("/api", router);

initializeData().catch((err: unknown) => {
  logger.error({ err }, "Failed to initialize data");
});

export default app;
