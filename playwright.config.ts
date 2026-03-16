import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.test") });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${process.env.PORT || 3001}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "tsx server.ts",
    port: Number(process.env.PORT) || 3001,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: process.env.DATABASE_URL!,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS!,
      PORT: process.env.PORT || "3001",
    },
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
});
