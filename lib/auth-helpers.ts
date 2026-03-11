import { auth } from "./auth";
import { prisma } from "./prisma";
import type { WorkspaceRole } from "@prisma/client";

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
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member) {
    throw new Error("Not a member of this workspace");
  }

  return member;
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
