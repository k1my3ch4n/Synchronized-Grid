import type { Browser } from "@playwright/test";

const BASE_URL = `http://localhost:${process.env.PORT || 3001}`;

/**
 * Credentials provider로 로그인하여 storageState를 저장합니다.
 */
export async function authenticateUser(
  browser: Browser,
  user: { email: string; name: string },
  storageStatePath: string,
) {
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. CSRF 토큰 가져오기
  const csrfRes = await page.request.get(`${BASE_URL}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();

  // 2. Credentials provider로 로그인
  await page.request.post(
    `${BASE_URL}/api/auth/callback/test-credentials`,
    {
      form: {
        csrfToken,
        email: user.email,
        name: user.name,
      },
    },
  );

  // 3. storageState 저장 (세션 쿠키 포함)
  await context.storageState({ path: storageStatePath });
  await context.close();
}
