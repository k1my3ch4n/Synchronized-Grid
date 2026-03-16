import { test, expect } from "@playwright/test";
import { cleanupWorkspaces } from "./helpers";

test.use({ storageState: "e2e/.auth/user-a.json" });

test.describe("Workspace CRUD", () => {
  test.beforeEach(async ({ request }) => {
    await cleanupWorkspaces(request);
  });

  test("shows empty state when no workspaces exist", async ({ page }) => {
    await page.goto("/workspaces");
    await expect(page.getByText("아직 워크스페이스가 없습니다")).toBeVisible();
  });

  test("can create a workspace", async ({ page }) => {
    await page.goto("/workspaces");

    // 모달 열기
    await page.getByRole("button", { name: "+ 새로 만들기" }).click();
    await expect(page.getByText("이름")).toBeVisible();

    // 이름 입력 후 생성
    await page.getByPlaceholder("내 워크스페이스").fill("테스트 워크스페이스");
    await page.getByRole("button", { name: "생성" }).click();

    // 목록에 표시 확인
    await expect(page.getByText("테스트 워크스페이스")).toBeVisible();
  });

  test("can navigate to workspace detail", async ({ page, request }) => {
    // API로 워크스페이스 생성
    const res = await request.post("/api/workspaces", {
      data: { name: "상세 진입 테스트" },
    });
    const workspace = await res.json();

    await page.goto("/workspaces");
    await page.getByText("상세 진입 테스트").click();

    await expect(page).toHaveURL(new RegExp(`/workspace/${workspace.id}`));
  });

  test("can delete a workspace", async ({ page, request }) => {
    // API로 워크스페이스 생성
    await request.post("/api/workspaces", {
      data: { name: "삭제 테스트" },
    });

    await page.goto("/workspaces");
    await expect(page.getByText("삭제 테스트")).toBeVisible();

    // 카드의 삭제 버튼 클릭 (목록 내)
    await page
      .getByRole("listitem")
      .getByRole("button", { name: "삭제" })
      .click();

    // 삭제 확인 모달에서 삭제 버튼 클릭
    await expect(page.getByText("워크스페이스 삭제")).toBeVisible();
    await page.getByRole("button", { name: "삭제" }).nth(1).click();

    // 목록에서 사라짐 확인
    await expect(
      page.getByRole("heading", { name: "삭제 테스트" }),
    ).not.toBeVisible();
  });
});
