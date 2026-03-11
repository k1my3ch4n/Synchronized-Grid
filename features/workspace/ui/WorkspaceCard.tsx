"use client";

import type { WorkspaceResponse } from "@shared/types";

interface WorkspaceCardProps {
  workspace: WorkspaceResponse;
  onClick: () => void;
}

export function WorkspaceCard({ workspace, onClick }: WorkspaceCardProps) {
  return (
    <li
      onClick={onClick}
      className="glass-surface rounded-glass p-5 cursor-pointer flex flex-col gap-3 transition-all hover:bg-glass-hover hover:border-glass-glow hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border-l-2 border-l-accent/40 hover:border-l-accent"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-sm text-text-primary">
          {workspace.name}
        </h3>
        <span className="text-xs text-text-muted">/{workspace.slug}</span>
      </div>
      <div className="flex gap-4 text-xs text-text-secondary">
        <span>{workspace._count?.rooms ?? 0}개 룸</span>
        <span>{workspace._count?.members ?? 0}명 멤버</span>
      </div>
    </li>
  );
}
