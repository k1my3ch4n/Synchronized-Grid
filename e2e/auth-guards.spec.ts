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

  test("non-member cannot access workspace API", async ({ request }) => {
    // User A가 워크스페이스 생성
    const contextA = await request.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    await cleanupWorkspaces(contextA);
    const res = await contextA.post("/api/workspaces", {
      data: { name: "접근 제한 테스트" },
    });
    const workspace = await res.json();

    // User B가 해당 워크스페이스에 접근 시도
    const contextB = await request.newContext({
      storageState: "e2e/.auth/user-b.json",
    });
    const forbidden = await contextB.get(
      `/api/workspaces/${workspace.id}`,
    );
    expect(forbidden.status()).toBe(403);

    await contextA.dispose();
    await contextB.dispose();
  });
});
