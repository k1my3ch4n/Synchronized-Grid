import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@server/io";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    db: "error",
    socket: "error",
  };

  // DB 연결 확인
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.db = "ok";
  } catch {
    // DB 연결 실패
  }

  // Socket.IO 서버 확인
  try {
    const io = getIO();
    if (io) {
      checks.socket = "ok";
    }
  } catch {
    // Socket.IO 미초기화
  }

  const healthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
