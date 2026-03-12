import { auth } from "./auth";
import { prisma } from "./prisma";
import type { WorkspaceRole } from "@prisma/client";
import { WORKSPACE_ROLES } from "@shared/constants";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

export async function requireWorkspaceMember(
  workspaceId: string,
  userId: string,
) {
  // WorkspaceMember 테이블에서 조회
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (member) {
    return member;
  }

  // 소유자인 경우 가상 멤버 반환
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { ownerId: true },
  });

  if (workspace?.ownerId === userId) {
    return {
      id: "owner",
      workspaceId,
      userId,
      role: WORKSPACE_ROLES.OWNER,
      joinedAt: new Date(),
    };
  }

  throw new Error("Not a member of this workspace");
}

export function hasPermission(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole,
): boolean {
  const hierarchy: Record<WorkspaceRole, number> = {
    OWNER: 3,
    EDITOR: 2,
    VIEWER: 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
}
