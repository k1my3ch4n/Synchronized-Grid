import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@server/io";
import { logger } from "@server/logger";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    db: "error",
    socket: "error",
  };

  // DB 연결 확인
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch (err) {
    logger.error("health-check", "DB connection failed", err);
  }

  // Socket.IO 서버 확인
  try {
    const io = getIO();
    if (io) {
      checks.socket = "ok";
    }
  } catch (err) {
    logger.error("health-check", "Socket.IO check failed", err);
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
