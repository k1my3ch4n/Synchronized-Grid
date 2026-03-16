import { test, expect } from "@playwright/test";
import { createWorkspaceViaAPI, cleanupWorkspaces } from "./helpers";

test.describe("Auth Guards", () => {
  test("unauthenticated API request returns 401", async ({ request }) => {
    const res = await request.get("/api/workspaces");
    expect(res.status()).toBe(401);
  });

  test("unauthenticated page access redirects to /login", async ({ page }) => {
    await page.goto("/workspaces");
    await expect(page).toHaveURL(/\/login/);
  });

  test("non-member cannot access workspace API", async ({ browser }) => {
    // User A가 워크스페이스 생성
    const contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    await cleanupWorkspaces(contextA.request);
    const ws = await createWorkspaceViaAPI(
      contextA.request,
      "접근 제한 테스트",
    );

    // User B가 해당 워크스페이스에 접근 시도
    const contextB = await browser.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    const forbidden = await contextB.request.get(`/api/workspaces/${ws.id}`);
    expect(forbidden.status()).toBe(403);

    await contextA.close();
    await contextB.close();
  });
});
