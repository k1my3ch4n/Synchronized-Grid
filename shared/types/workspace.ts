export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface WorkspaceUser {
  id: string;
  userId: string;
  name: string;
  color: string;
  role: WorkspaceRole;
  cursor?: { x: number; y: number };
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { members: number };
}
