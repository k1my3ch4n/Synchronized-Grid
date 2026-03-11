import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireWorkspaceMember,
  hasPermission,
} from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await requireWorkspaceMember(id, user.id!);

    const rooms = await prisma.room.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Not a member of this workspace") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const member = await requireWorkspaceMember(id, user.id!);

    if (!hasPermission(member.role, "EDITOR")) {
      return NextResponse.json(
        { error: "EDITOR 이상의 권한이 필요합니다" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "룸 이름은 필수입니다" },
        { status: 400 },
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: "룸 이름은 50자 이하여야 합니다" },
        { status: 400 },
      );
    }

    const room = await prisma.room.create({
      data: {
        name: name.trim(),
        workspaceId: id,
        createdById: user.id!,
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "Not a member of this workspace") {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "룸 생성에 실패했습니다" },
      { status: 500 },
    );
  }
}
