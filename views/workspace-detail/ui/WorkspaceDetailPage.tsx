"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUrlStore } from "@features/url-input";
import { useWorkspaceStore, WorkspaceContext } from "@features/workspace";
import { CanvasEditor } from "@widgets/canvas";
import { UrlInput } from "@features/url-input";

export function WorkspaceDetailPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { url } = useUrlStore();
  const router = useRouter();
  const isConnected = useWorkspaceStore((state) => state.isConnected);
  const error = useWorkspaceStore((state) => state.error);
  const kickReason = useWorkspaceStore((state) => state.kickReason);

  useEffect(() => {
    useWorkspaceStore.getState().joinWorkspace(workspaceId);

    return () => {
      useWorkspaceStore.getState().leaveWorkspace();
      useUrlStore.getState().setUrl("");
    };
  }, [workspaceId]);

  // 추방 또는 워크스페이스 삭제 시 리다이렉트
  useEffect(() => {
    if (kickReason) {
      toast.error(kickReason);
      useWorkspaceStore.getState().leaveWorkspace();
      router.push("/workspaces");
    }
  }, [kickReason, router]);

  if (error) {
    return (
      <main className="page-height flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← 돌아가기
        </button>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="page-height flex flex-col items-center justify-center gap-3">
        <div className="loading-spinner" />
        <p className="text-sm text-text-secondary">워크스페이스에 접속 중...</p>
      </main>
    );
  }

  return (
    <WorkspaceContext.Provider value={{ isInWorkspace: true, workspaceId }}>
      <main className="page-height">
        {!url ? (
          <div className="flex items-center justify-center page-height">
            <UrlInput />
          </div>
        ) : (
          <CanvasEditor />
        )}
      </main>
    </WorkspaceContext.Provider>
  );
}
