import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { authenticateUser } from "./auth-setup";

const AUTH_DIR = path.join(__dirname, ".auth");

export const TEST_USERS = {
  userA: { email: "test-user-a@example.com", name: "Test User A" },
  userB: { email: "test-user-b@example.com", name: "Test User B" },
};

export default async function globalSetup() {
  // 1. 인증 상태 디렉토리 생성
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  // 2. 테스트 DB 스키마 동기화
  execSync("npx prisma db push --force-reset --skip-generate", {
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "test" },
  });

  // 3. 테스트 유저 인증 → storageState 저장
  const browser = await chromium.launch();

  await authenticateUser(
    browser,
    TEST_USERS.userA,
    path.join(AUTH_DIR, "user-a.json"),
  );

  await authenticateUser(
    browser,
    TEST_USERS.userB,
    path.join(AUTH_DIR, "user-b.json"),
  );

  await browser.close();
}
