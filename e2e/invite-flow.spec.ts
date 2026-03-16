import { test, expect } from "@playwright/test";
import { createWorkspaceViaAPI, cleanupWorkspaces } from "./helpers";

test.describe("Invite Flow", () => {
  let workspaceId: string;

  test.beforeEach(async ({ request }) => {
    // User A로 워크스페이스 정리 및 생성
    const contextA = await request.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    await cleanupWorkspaces(contextA);
    const ws = await createWorkspaceViaAPI(contextA, "초대 테스트");
    workspaceId = ws.id;
    await contextA.dispose();
  });

  test("owner can generate invite token", async ({ request }) => {
    const contextA = await request.newContext({
      storageState: "e2e/.auth/user-a.json",
    });

    const res = await contextA.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe("string");

    await contextA.dispose();
  });

  test("invited user can accept invite and join workspace", async ({
    request,
  }) => {
    // User A가 초대 토큰 생성
    const contextA = await request.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    const inviteRes = await contextA.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    const { token } = await inviteRes.json();

    // User B가 초대 수락
    const contextB = await request.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    const acceptRes = await contextB.post(`/api/invite/${token}`);
    expect(acceptRes.ok()).toBeTruthy();

    const body = await acceptRes.json();
    expect(body.joined).toBe(true);
    expect(body.workspaceId).toBe(workspaceId);

    // User B가 이제 워크스페이스 접근 가능
    const accessRes = await contextB.get(
      `/api/workspaces/${workspaceId}`,
    );
    expect(accessRes.ok()).toBeTruthy();

    await contextA.dispose();
    await contextB.dispose();
  });

  test("already-member gets alreadyMember response", async ({ request }) => {
    // User A가 초대 토큰 생성
    const contextA = await request.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    const inviteRes = await contextA.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    const { token } = await inviteRes.json();

    // User B가 초대 수락
    const contextB = await request.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    await contextB.post(`/api/invite/${token}`);

    // User B가 다시 초대 수락 시도
    const duplicateRes = await contextB.post(`/api/invite/${token}`);
    const body = await duplicateRes.json();
    expect(body.alreadyMember).toBe(true);

    await contextA.dispose();
    await contextB.dispose();
  });
});
