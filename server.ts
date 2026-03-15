import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setupSocketHandlers } from "./server/socket-handlers";
import { setupSocketAuth } from "./server/socket-auth";
import { setIO } from "./server/io";
import { flushAllPendingSaves } from "./server/workspace-persistence";
import { logger } from "./server/logger";
import "dotenv/config";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const allowedOrigins = (process.env.ALLOWED_ORIGINS?.split(",") || [])
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    allowedOrigins.push(`http://localhost:${process.env.PORT || 3000}`);
  }

  const io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    path: "/api/socket",
  });

  setIO(io);
  setupSocketAuth(io);
  setupSocketHandlers(io);

  const PORT = process.env.PORT || 3000;

  httpServer.listen(PORT, () => {
    logger.info("server", `Ready on http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info("server", `${signal} received. Shutting down gracefully...`);

    // 1. pending save flush
    await flushAllPendingSaves();
    logger.info("server", "Pending saves flushed");

    // 2. 소켓 연결 종료
    io.close();
    logger.info("server", "Socket.IO closed");

    // 3. HTTP 서버 종료
    httpServer.close(() => {
      logger.info("server", "HTTP server closed");
      process.exit(0);
    });

    // 강제 종료 타임아웃 (10초)
    setTimeout(() => {
      logger.error("server", "Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
});
