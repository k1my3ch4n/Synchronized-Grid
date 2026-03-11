"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@features/auth";
import { WorkspaceCard, CreateWorkspaceModal } from "@features/workspace";
import { fetchWorkspaces, createWorkspace } from "@entities/workspace";
import type { WorkspaceResponse } from "@shared/types";

export function WorkspaceListPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch {
      // 인증 실패 시 AuthGuard가 처리
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleCreate = async (data: { name: string; slug: string }) => {
    await createWorkspace(data);
    setShowCreate(false);
    await loadWorkspaces();
  };

  return (
    <AuthGuard>
      <main className="page-height flex items-center justify-center">
        <div className="glass rounded-2xl w-[95%] max-w-[480px] overflow-hidden">
          <div className="px-7 pt-7 pb-5 border-b border-glass-border flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                워크스페이스
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                협업 그리드를 관리하세요
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="glass-btn px-4 py-2 text-sm whitespace-nowrap"
            >
              + 새로 만들기
            </button>
          </div>
          <div className="px-7 py-6">
            {loading ? (
              <p className="text-sm text-text-muted text-center py-6">
                불러오는 중...
              </p>
            ) : workspaces.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                워크스페이스를 만들어 협업을 시작하세요
              </p>
            ) : (
              <ul className="space-y-2">
                {workspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    onClick={() => router.push(`/workspaces/${ws.id}`)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateWorkspaceModal
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </AuthGuard>
  );
}
