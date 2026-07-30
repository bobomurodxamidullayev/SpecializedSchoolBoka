import express, { type Express } from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";
import { initializeData, UPLOADS_DIR } from "./lib/dataManager.js";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

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