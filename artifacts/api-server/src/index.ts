import app from "./app";
import { logger } from "./lib/logger";

const port = Number(process.env["PORT"]) || 8080;

// Express listen funksiyasi
const server = app.listen(port, "0.0.0.0", () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (err) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});