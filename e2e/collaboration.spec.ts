import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { cleanupWorkspaces } from "./helpers";

test.describe("Real-time Collaboration", () => {
  let contextA: BrowserContext;
  let contextB: BrowserContext;
  let pageA: Page;
  let pageB: Page;
  let workspaceId: string;

  test.beforeAll(async ({ browser }) => {
    // 두 유저의 브라우저 컨텍스트 생성
    contextA = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    contextB = await browser.newContext({
      storageState: "e2e/.auth/user-b.json",
    });

    pageA = await contextA.newPage();

    // User A가 워크스페이스 생성
    await cleanupWorkspaces(contextA.request);

    const res = await contextA.request.post("/api/workspaces", {
      data: { name: "협업 테스트" },
    });

    const ws = await res.json();
    workspaceId = ws.id;

    // User B를 초대
    const inviteRes = await contextA.request.post(
      `/api/workspaces/${workspaceId}/invite`,
    );
    const { token } = await inviteRes.json();
    await contextB.request.post(`/api/invite/${token}`);

    pageB = await contextB.newPage();
  });

  test.afterAll(async () => {
    await contextA?.close();
    await contextB?.close();
  });

  test("two users see each other in user presence", async () => {
    // User A 접속
    await pageA.goto(`/workspace/${workspaceId}`);
    await expect(pageA.getByPlaceholder("https://example.com")).toBeVisible({
      timeout: 10000,
    });

    // User B 접속
    await pageB.goto(`/workspace/${workspaceId}`);
    await expect(pageB.getByPlaceholder("https://example.com")).toBeVisible({
      timeout: 10000,
    });

    // User A 화면에서 유저 아바타가 2개 표시되는지 확인
    // (첫 글자 이니셜: "T" for Test User A/B)
    const avatarsA = pageA.locator(
      "div.rounded-full.flex.items-center.justify-center",
    );
    await expect(avatarsA).toHaveCount(2, { timeout: 5000 });
  });

  test("URL change syncs between users", async () => {
    // User A가 URL 설정
    await pageA.goto(`/workspace/${workspaceId}`);
    const urlInputA = pageA.getByPlaceholder("https://example.com");
    await expect(urlInputA).toBeVisible({ timeout: 10000 });

    // User B 접속
    await pageB.goto(`/workspace/${workspaceId}`);
    await expect(pageB.getByPlaceholder("https://example.com")).toBeVisible({
      timeout: 10000,
    });

    // User A가 URL 입력
    await urlInputA.fill("https://example.com");
    await pageA.getByRole("button", { name: "Load" }).click();

    // User A에서 캔버스 표시 확인
    await expect(urlInputA).not.toBeVisible({ timeout: 10000 });

    // User B에서도 URL이 동기화되어 캔버스가 표시되는지 확인
    await expect(pageB.getByPlaceholder("https://example.com")).not.toBeVisible(
      { timeout: 10000 },
    );
  });

  test.skip("kicked member gets redirected to workspace list", async () => {
    // TODO: Owner가 멤버 추방 시 해당 멤버 리다이렉트 검증
  });
});
