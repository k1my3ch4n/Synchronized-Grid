import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with title and description", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("프로젝트 싱긋 ( Syngrid )")).toBeVisible();
    await expect(
      page.getByText("하나의 URL을 여러 디바이스 뷰포트로 동시에 확인하고"),
    ).toBeVisible();
  });

  test("shows feature cards", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("멀티 뷰포트")).toBeVisible();
    await expect(page.getByText("실시간 동기화")).toBeVisible();
    await expect(page.getByText("팀 협업")).toBeVisible();
    await expect(page.getByText("간편한 시작")).toBeVisible();
  });

  test("시작하기 button navigates to login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "시작하기" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("GitHub link opens in new tab", async ({ page }) => {
    await page.goto("/");

    const githubLink = page.getByRole("link", { name: "GitHub" });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute(
      "href",
      /github\.com\/k1my3ch4n\/Synchronized-Grid/,
    );
  });

  test("authenticated user accessing / redirects to /workspaces", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      storageState: "e2e/.auth/user-a.json",
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(page).toHaveURL(/\/workspaces/);

    await context.close();
  });
});
