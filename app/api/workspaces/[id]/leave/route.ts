import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireWorkspaceMember } from "@/lib/auth-helpers";
import { WORKSPACE_ROLES } from "@shared/constants";

type RouteParams = { params: Promise<{ id: string }> };

// 워크스페이스 나가기 (비OWNER 멤버 전용)
export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const member = await requireWorkspaceMember(id, user.id!);

    if (member.role === WORKSPACE_ROLES.OWNER) {
      return NextResponse.json(
        { error: "소유자는 워크스페이스를 나갈 수 없습니다" },
        { status: 400 },
      );
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId: user.id! } },
    });

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
