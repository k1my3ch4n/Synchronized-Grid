import { test, expect } from "@playwright/test";
import { createWorkspaceViaAPI, cleanupWorkspaces } from "./helpers";

test.use({ storageState: "e2e/.auth/user-a.json" });

test.describe("Workspace Detail & Viewport", () => {
  let workspaceId: string;

  test.beforeEach(async ({ request }) => {
    await cleanupWorkspaces(request);
    const ws = await createWorkspaceViaAPI(request, "뷰포트 테스트");
    workspaceId = ws.id;
  });

  test("shows URL input when no URL is set", async ({ page }) => {
    await page.goto(`/workspace/${workspaceId}`);

    // 소켓 연결 대기
    await expect(page.getByText("워크스페이스에 접속 중...")).toBeVisible();
    await expect(
      page.getByPlaceholder("https://example.com"),
    ).toBeVisible({ timeout: 10000 });
  });

  test("can set a URL and see canvas", async ({ page }) => {
    await page.goto(`/workspace/${workspaceId}`);

    // 소켓 연결 대기 후 URL 입력
    const urlInput = page.getByPlaceholder("https://example.com");
    await expect(urlInput).toBeVisible({ timeout: 10000 });

    await urlInput.fill("https://example.com");
    await page.getByRole("button", { name: "Load" }).click();

    // CanvasEditor가 렌더링되면 URL 입력은 사라짐
    await expect(urlInput).not.toBeVisible({ timeout: 10000 });
  });

  test("can add a viewport", async ({ page }) => {
    await page.goto(`/workspace/${workspaceId}`);

    // URL 설정
    const urlInput = page.getByPlaceholder("https://example.com");
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.fill("https://example.com");
    await page.getByRole("button", { name: "Load" }).click();
    await expect(urlInput).not.toBeVisible({ timeout: 10000 });

    // 뷰포트 추가
    await page.getByText("+ Add Preset").click();
    await page.getByPlaceholder("Label").fill("Test Viewport");
    await page.getByPlaceholder("W").fill("400");
    await page.getByPlaceholder("H").fill("300");
    await page.getByRole("button", { name: "OK" }).click();

    // 캔버스에 뷰포트 표시 확인
    await expect(page.getByText("Test Viewport")).toBeVisible();
  });

  test("can remove a viewport", async ({ page }) => {
    await page.goto(`/workspace/${workspaceId}`);

    // URL 설정
    const urlInput = page.getByPlaceholder("https://example.com");
    await expect(urlInput).toBeVisible({ timeout: 10000 });
    await urlInput.fill("https://example.com");
    await page.getByRole("button", { name: "Load" }).click();
    await expect(urlInput).not.toBeVisible({ timeout: 10000 });

    // 뷰포트 추가
    await page.getByText("+ Add Preset").click();
    await page.getByPlaceholder("Label").fill("삭제할 뷰포트");
    await page.getByPlaceholder("W").fill("400");
    await page.getByPlaceholder("H").fill("300");
    await page.getByRole("button", { name: "OK" }).click();
    await expect(page.getByText("삭제할 뷰포트")).toBeVisible();

    // 뷰포트 삭제
    await page.getByLabel("삭제").click();
    await expect(page.getByText("삭제할 뷰포트")).not.toBeVisible();
  });
});
