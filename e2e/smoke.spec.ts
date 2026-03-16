import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("health check returns ok db status", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    expect(body.checks.db).toBe("ok");
  });

  test("login page renders with Google login button", async ({ page }) => {
    await page.goto("/login");

    // 로그인 페이지의 헤딩 (네비게이션에도 "싱긋"이 있으므로 nth 사용)
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
    await expect(
      page.getByText("로그인하여 워크스페이스에 참여하세요"),
    ).toBeVisible();
  });

  test("unauthenticated access to /workspaces redirects to /login", async ({
    page,
  }) => {
    await page.goto("/workspaces");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated access to / redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated API request returns 401", async ({ request }) => {
    const res = await request.get("/api/workspaces");
    expect(res.status()).toBe(401);
  });
});
