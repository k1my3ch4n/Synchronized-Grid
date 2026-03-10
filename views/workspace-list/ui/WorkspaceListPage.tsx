"use client";

import { AuthGuard } from "@features/auth";

export function WorkspaceListPage() {
  return (
    <AuthGuard>
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">
            워크스페이스
          </h2>
          <p className="text-sm text-text-muted">
            워크스페이스 기능은 Phase 2에서 구현됩니다
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
