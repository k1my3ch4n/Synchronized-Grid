"use client";

import type { WorkspaceResponse } from "@shared/types";
import { useInviteLink } from "@shared/hooks/useInviteLink";

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
  currentUserId?: string;
  onClick: () => void;
  onDelete?: (workspaceId: string) => void;
}

export function WorkspaceCard({
  workspace,
  currentUserId,
  onClick,
  onDelete,
}: WorkspaceCardProps) {
  const { copied, loading, copyInviteLink } = useInviteLink(workspace.id);

  const handleInvite = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyInviteLink();
  };

  return (
    <li
      onClick={onClick}
      className="glass-surface rounded-glass p-5 cursor-pointer flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-glass-hover hover:border-glass-glow hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border-l-2 border-l-accent/40 hover:border-l-accent"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm text-text-primary">
          {workspace.name}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleInvite}
            disabled={loading}
            className="text-xs text-text-muted hover:text-accent transition-colors px-2 py-1 rounded disabled:opacity-50"
          >
            {loading ? "생성 중..." : copied ? "복사됨!" : "초대 링크"}
          </button>
          {onDelete && currentUserId === workspace.ownerId && (
            <button
              data-testid="delete-workspace-button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(workspace.id);
              }}
              className="text-xs text-text-muted hover:text-gd-rose transition-colors px-2 py-1 rounded"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-4 text-xs text-text-secondary">
        <span>{workspace._count?.members ?? 0}명 멤버</span>
      </div>
    </li>
  );
}
