import { test, expect } from "@playwright/test";

test.describe("Terms Page", () => {
  test("renders terms page with all sections", async ({ page }) => {
    await page.goto("/terms");

    await expect(page.getByText("서비스 이용약관")).toBeVisible();
    await expect(page.getByText("서비스 소개")).toBeVisible();
    await expect(page.getByText("수집하는 개인정보")).toBeVisible();
    await expect(page.getByText("면책 사항")).toBeVisible();
  });

  test("contains GitHub Issues link", async ({ page }) => {
    await page.goto("/terms");

    const githubLink = page.getByRole("link", {
      name: /github\.com\/k1my3ch4n\/Synchronized-Grid/,
    });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/k1my3ch4n/Synchronized-Grid/issues",
    );
  });

  test("contains contact email", async ({ page }) => {
    await page.goto("/terms");

    const emailLink = page.getByRole("link", { name: "k1my3ch4n@gmail.com" });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:k1my3ch4n@gmail.com",
    );
  });

  test("back to login link works", async ({ page }) => {
    await page.goto("/terms");

    await page.getByRole("link", { name: "로그인으로 돌아가기" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page has terms link", async ({ page }) => {
    await page.goto("/login");

    const termsLink = page.getByRole("link", { name: "서비스 이용약관" });
    await expect(termsLink).toBeVisible();

    await termsLink.click();
    await expect(page).toHaveURL(/\/terms/);
  });
});
