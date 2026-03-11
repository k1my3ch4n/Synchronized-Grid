import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ token: string }> };

// 초대 수락: 워크스페이스 멤버로 추가
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { token } = await params;

    const invite = await prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          include: {
            rooms: { take: 1, orderBy: { createdAt: "asc" } },
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "유효하지 않은 초대 링크입니다" },
        { status: 404 },
      );
    }

    // 만료 확인
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "만료된 초대 링크입니다" },
        { status: 410 },
      );
    }

    // 사용 횟수 확인
    if (invite.maxUses && invite.useCount >= invite.maxUses) {
      return NextResponse.json(
        { error: "초대 링크 사용 횟수를 초과했습니다" },
        { status: 410 },
      );
    }

    // 이미 멤버인지 확인
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: invite.workspaceId,
          userId: user.id!,
        },
      },
    });

    const defaultRoomId = invite.workspace.rooms[0]?.id ?? null;

    if (existingMember) {
      return NextResponse.json({
        alreadyMember: true,
        workspaceId: invite.workspaceId,
        defaultRoomId,
      });
    }

    // 멤버 추가 + 사용 횟수 증가
    await prisma.$transaction([
      prisma.workspaceMember.create({
        data: {
          workspaceId: invite.workspaceId,
          userId: user.id!,
          role: invite.role,
        },
      }),
      prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { useCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      joined: true,
      workspaceId: invite.workspaceId,
      defaultRoomId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
