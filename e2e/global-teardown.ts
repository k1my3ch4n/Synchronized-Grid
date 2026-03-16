import { execSync } from "child_process";

export default async function globalTeardown() {
  // 테스트 DB의 모든 데이터 정리 (스키마는 유지)
  try {
    execSync(
      'npx prisma db execute --stdin <<< "TRUNCATE \\"WorkspaceInvite\\", \\"WorkspaceMember\\", \\"Workspace\\", \\"Account\\", \\"User\\", \\"VerificationToken\\" CASCADE;"',
      { stdio: "pipe", env: { ...process.env, NODE_ENV: "test" } },
    );
  } catch {
    // DB가 이미 정리되었거나 연결할 수 없는 경우 무시
  }
}
