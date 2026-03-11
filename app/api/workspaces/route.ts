import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireAuth();

    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        _count: { select: { rooms: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(workspaces);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { name, slug } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "워크스페이스 이름은 필수입니다" },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "워크스페이스 이름은 50자 이하여야 합니다" },
        { status: 400 },
      );
    }

    if (!slug || typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다" },
        { status: 400 },
      );
    }

    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 슬러그입니다" },
        { status: 409 },
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: user.id!,
        members: {
          create: { userId: user.id!, role: "OWNER" },
        },
      },
      include: {
        _count: { select: { rooms: true, members: true } },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "워크스페이스 생성에 실패했습니다" },
      { status: 500 },
    );
  }
}
