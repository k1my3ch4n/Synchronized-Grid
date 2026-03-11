export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { rooms: number; members: number };
}

export interface WorkspaceMemberResponse {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface WorkspaceDetailResponse extends WorkspaceResponse {
  members: WorkspaceMemberResponse[];
}

export interface RoomResponse {
  id: string;
  name: string;
  workspaceId: string;
  url: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}
