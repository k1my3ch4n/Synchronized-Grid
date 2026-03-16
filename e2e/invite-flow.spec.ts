import { test, expect } from "@playwright/test";
import { createWorkspaceViaAPI, cleanupWorkspaces } from "./helpers";

test.describe("Invite Flow", () => {
  let workspaceId: string;

  test.beforeEach(async ({ browser }) => {
    const contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });

    await cleanupWorkspaces(contextA.request);

    const ws = await createWorkspaceViaAPI(contextA.request, "초대 테스트");
    workspaceId = ws.id;

    await contextA.close();
  });

  test("owner can generate invite token", async ({ browser }) => {
    const contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });

    const res = await contextA.request.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(typeof body.token).toBe("string");

    await contextA.close();
  });

  test("invited user can accept invite and join workspace", async ({
    browser,
  }) => {
    // User A가 초대 토큰 생성
    const contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    const inviteRes = await contextA.request.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    const { token } = await inviteRes.json();

    // User B가 초대 수락
    const contextB = await browser.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    const acceptRes = await contextB.request.post(`/api/invite/${token}`);
    expect(acceptRes.ok()).toBeTruthy();

    const body = await acceptRes.json();
    expect(body.joined).toBe(true);
    expect(body.workspaceId).toBe(workspaceId);

    // User B가 이제 워크스페이스 접근 가능
    const accessRes = await contextB.request.get(
      `/api/workspaces/${workspaceId}`,
    );
    expect(accessRes.ok()).toBeTruthy();

    await contextA.close();
    await contextB.close();
  });

  test("already-member gets alreadyMember response", async ({ browser }) => {
    // User A가 초대 토큰 생성
    const contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    const inviteRes = await contextA.request.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    const { token } = await inviteRes.json();

    // User B가 초대 수락
    const contextB = await browser.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    await contextB.request.post(`/api/invite/${token}`);

    // User B가 다시 초대 수락 시도
    const duplicateRes = await contextB.request.post(`/api/invite/${token}`);
    const body = await duplicateRes.json();
    expect(body.alreadyMember).toBe(true);

    await contextA.close();
    await contextB.close();
  });

  test("invalid invite token returns 404", async ({ browser }) => {
    const contextB = await browser.newContext({
      storageState: "e2e/.auth/user-b.json",
    });

    const res = await contextB.request.post(
      "/api/invite/00000000-0000-0000-0000-000000000000",
    );
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(body.error).toBeDefined();

    await contextB.close();
  });
});
