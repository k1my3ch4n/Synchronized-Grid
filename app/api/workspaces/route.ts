import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const user = await requireAuth();

    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = workspaces.map((ws) => ({
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      ownerId: ws.ownerId,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
      _count: { members: ws._count.members },
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const { name } = body;

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

    // 랜덤 슬러그 자동 생성 (충돌 시 재시도)
    let slug = "";
    for (let i = 0; i < 5; i++) {
      const candidate = `ws-${crypto.randomUUID().slice(0, 8)}`;
      const existing = await prisma.workspace.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing) {
        slug = candidate;
        break;
      }
    }

    if (!slug) {
      return NextResponse.json(
        { error: "슬러그 생성에 실패했습니다. 다시 시도해주세요." },
        { status: 500 },
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
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(
      {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        ownerId: workspace.ownerId,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        _count: { members: workspace._count.members },
      },
      { status: 201 },
    );
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
