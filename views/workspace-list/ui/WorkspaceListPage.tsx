"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard, useAuthStore } from "@features/auth";
import {
  WorkspaceCard,
  CreateWorkspaceModal,
  DeleteWorkspaceModal,
} from "@features/workspace";
import {
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
} from "@entities/workspace";
import type { WorkspaceResponse } from "@shared/types";
import { toast } from "sonner";

export function WorkspaceListPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceResponse | null>(
    null,
  );

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch {
      toast.error("워크스페이스 목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  const handleCreate = async (data: { name: string }) => {
    await createWorkspace(data);

    toast.success("워크스페이스가 생성되었습니다");
    setShowCreate(false);

    await loadWorkspaces();
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteWorkspace(deleteTarget.id);
      toast.success("워크스페이스가 삭제되었습니다");
      setDeleteTarget(null);
      await loadWorkspaces();
    } catch {
      toast.error("삭제에 실패했습니다");
    }
  };

  return (
    <AuthGuard>
      <main className="page-height flex items-center justify-center">
        <div className="glass rounded-2xl w-[95%] max-w-[640px] overflow-hidden">
          <div className="px-7 pt-8 pb-6 border-b border-glass-border flex justify-between items-center">
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
          <div className="px-7 py-8">
            {loading ? (
              <p className="text-sm text-text-muted text-center py-6">
                불러오는 중...
              </p>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-4 opacity-30">&#x229E;</div>
                <p className="text-sm text-text-secondary mb-1">
                  아직 워크스페이스가 없습니다
                </p>
                <p className="text-xs text-text-muted">
                  상단의 &quot;+ 새로 만들기&quot; 버튼으로 협업을 시작하세요
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {workspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    currentUserId={user?.id}
                    onClick={() => {
                      router.push(`/workspace/${ws.id}`);
                    }}
                    onDelete={(id) =>
                      setDeleteTarget(
                        workspaces.find((w) => w.id === id) ?? null,
                      )
                    }
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

      {deleteTarget && (
        <DeleteWorkspaceModal
          workspaceName={deleteTarget.name}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AuthGuard>
  );
}
