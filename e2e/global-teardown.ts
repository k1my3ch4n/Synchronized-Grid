import { execSync } from "child_process";

export default async function globalTeardown() {
  // 테스트 DB의 모든 데이터 정리 (스키마는 유지)
  try {
    execSync(
      'npx prisma db execute --stdin <<< "TRUNCATE \\"WorkspaceInvite\\", \\"WorkspaceMember\\", \\"Workspace\\", \\"Account\\", \\"User\\", \\"VerificationToken\\" CASCADE;"',
      { stdio: "pipe", env: { ...process.env, NODE_ENV: "test" } },
    );
  } catch (err) {
    console.warn("[global-teardown] DB cleanup failed:", err);
  }
}
