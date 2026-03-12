export type WorkspaceRole = "OWNER" | "EDITOR" | "VIEWER";

export interface WorkspaceUser {
  id: string;
  name: string;
  color: string;
  role: WorkspaceRole;
  cursor?: { x: number; y: number };
}
