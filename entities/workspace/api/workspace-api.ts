import type {
  WorkspaceResponse,
  WorkspaceDetailResponse,
  RoomResponse,
} from "@shared/types";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function fetchWorkspaces(): Promise<WorkspaceResponse[]> {
  const res = await fetch("/api/workspaces");

  return handleResponse<WorkspaceResponse[]>(res);
}

export async function createWorkspace(data: {
  name: string;
  slug: string;
}): Promise<WorkspaceResponse> {
  const res = await fetch("/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<WorkspaceResponse>(res);
}

export async function fetchWorkspaceDetail(
  id: string,
): Promise<WorkspaceDetailResponse> {
  const res = await fetch(`/api/workspaces/${id}`);

  return handleResponse<WorkspaceDetailResponse>(res);
}

export async function deleteWorkspace(id: string): Promise<void> {
  const res = await fetch(`/api/workspaces/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "삭제 실패");
  }
}

export async function fetchWorkspaceRooms(
  workspaceId: string,
): Promise<RoomResponse[]> {
  const res = await fetch(`/api/workspaces/${workspaceId}/rooms`);

  return handleResponse<RoomResponse[]>(res);
}

export async function createRoom(
  workspaceId: string,
  data: { name: string },
): Promise<RoomResponse> {
  const res = await fetch(`/api/workspaces/${workspaceId}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return handleResponse<RoomResponse>(res);
}

export async function deleteRoom(
  workspaceId: string,
  roomId: string,
): Promise<void> {
  const res = await fetch(`/api/workspaces/${workspaceId}/rooms/${roomId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    throw new Error(body.error || "삭제 실패");
  }
}
