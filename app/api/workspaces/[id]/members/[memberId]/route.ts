import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireWorkspaceMember,
  hasPermission,
} from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

// 멤버 역할 변경
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;

    const currentMember = await requireWorkspaceMember(id, user.id!);

    if (!hasPermission(currentMember.role, "OWNER")) {
      return NextResponse.json(
        { error: "OWNER 권한이 필요합니다" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!["EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다" },
        { status: 400 },
      );
    }

    // 대상 멤버 확인
    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== id) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    // 자기 자신의 역할은 변경 불가
    if (targetMember.userId === user.id) {
      return NextResponse.json(
        { error: "자신의 역할은 변경할 수 없습니다" },
        { status: 400 },
      );
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(updated);
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

// 멤버 추방
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id, memberId } = await params;

    const currentMember = await requireWorkspaceMember(id, user.id!);

    if (!hasPermission(currentMember.role, "OWNER")) {
      return NextResponse.json(
        { error: "OWNER 권한이 필요합니다" },
        { status: 403 },
      );
    }

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== id) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    if (targetMember.userId === user.id) {
      return NextResponse.json(
        { error: "자기 자신은 추방할 수 없습니다" },
        { status: 400 },
      );
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });

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
