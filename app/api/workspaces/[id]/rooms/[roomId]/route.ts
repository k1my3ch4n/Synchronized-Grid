import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireWorkspaceMember,
  hasPermission,
} from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string; roomId: string }> };

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id, roomId } = await params;

    const member = await requireWorkspaceMember(id, user.id!);

    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room || room.workspaceId !== id) {
      return NextResponse.json(
        { error: "룸을 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    const isCreator = room.createdById === user.id;
    const isEditor = hasPermission(member.role, "EDITOR");

    if (!isCreator && !isEditor) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다" },
        { status: 403 },
      );
    }

    await prisma.room.delete({ where: { id: roomId } });

    return NextResponse.json({ success: true });
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
