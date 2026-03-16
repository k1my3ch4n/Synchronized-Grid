import type { APIRequestContext } from "@playwright/test";

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;

/**
 * API를 통해 워크스페이스를 생성합니다.
 */
export async function createWorkspaceViaAPI(
  request: APIRequestContext,
  name: string,
) {
  const res = await request.post(`${BASE_URL}/api/workspaces`, {
    data: { name },
  });
  return res.json();
}

/**
 * API를 통해 워크스페이스를 삭제합니다.
 */
export async function deleteWorkspaceViaAPI(
  request: APIRequestContext,
  workspaceId: string,
) {
  return request.delete(`${BASE_URL}/api/workspaces/${workspaceId}`);
}

/**
 * API를 통해 모든 워크스페이스를 조회 후 삭제합니다.
 */
export async function cleanupWorkspaces(request: APIRequestContext) {
  const res = await request.get(`${BASE_URL}/api/workspaces`);
  const workspaces = await res.json();

  if (Array.isArray(workspaces)) {
    for (const ws of workspaces) {
      await deleteWorkspaceViaAPI(request, ws.id);
    }
  }
}
