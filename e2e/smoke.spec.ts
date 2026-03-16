import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("health check returns 200 with healthy status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.checks.db).toBe("ok");
    expect(body.checks.socket).toBe("ok");
  });

  test("login page renders with Google login button", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "싱긋" })).toBeVisible();
    await expect(page.getByText("Google로 계속하기")).toBeVisible();
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
