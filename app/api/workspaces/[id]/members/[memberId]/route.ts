import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  requireWorkspaceMember,
  hasPermission,
} from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string; memberId: string }> };

// memberId 또는 userId로 멤버 조회
async function findMember(workspaceId: string, memberId: string) {
  // 먼저 memberId(PK)로 조회
  const byId = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
  });

  if (byId && byId.workspaceId === workspaceId) return byId;

  // userId로 조회 (소켓에서 userId를 전달하는 경우)
  const byUserId = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: memberId } },
  });

  return byUserId;
}

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

    if (!["OWNER", "EDITOR", "VIEWER"].includes(role)) {
      return NextResponse.json(
        { error: "유효하지 않은 역할입니다" },
        { status: 400 },
      );
    }

    const targetMember = await findMember(id, memberId);

    if (!targetMember) {
      return NextResponse.json(
        { error: "멤버를 찾을 수 없습니다" },
        { status: 404 },
      );
    }

    if (targetMember.userId === user.id) {
      return NextResponse.json(
        { error: "자신의 역할은 변경할 수 없습니다" },
        { status: 400 },
      );
    }

    // 소유권 이전
    if (role === "OWNER") {
      await prisma.$transaction([
        // 워크스페이스 소유자 변경
        prisma.workspace.update({
          where: { id },
          data: { ownerId: targetMember.userId },
        }),
        // 새 소유자를 멤버에서 OWNER로 변경
        prisma.workspaceMember.update({
          where: { id: targetMember.id },
          data: { role: "OWNER" },
        }),
        // 기존 소유자를 EDITOR 멤버로 추가 (없으면 생성)
        prisma.workspaceMember.upsert({
          where: {
            workspaceId_userId: { workspaceId: id, userId: user.id! },
          },
          update: { role: "EDITOR" },
          create: {
            workspaceId: id,
            userId: user.id!,
            role: "EDITOR",
          },
        }),
      ]);

      return NextResponse.json({ transferred: true });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: targetMember.id },
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

    const targetMember = await findMember(id, memberId);

    if (!targetMember) {
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

    await prisma.workspaceMember.delete({ where: { id: targetMember.id } });

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
