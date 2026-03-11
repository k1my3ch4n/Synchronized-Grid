import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceMember } from "@/lib/auth-helpers";

type RouteParams = { params: Promise<{ id: string }> };

// 초대 링크 생성 (또는 기존 링크 반환)
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    await requireWorkspaceMember(id, user.id!);

    // 기존 유효한 초대가 있으면 재사용
    const existing = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId: id,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (existing) {
      return NextResponse.json({ token: existing.token });
    }

    // 새 초대 생성
    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId: id,
        createdById: user.id!,
      },
    });

    return NextResponse.json({ token: invite.token }, { status: 201 });
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
