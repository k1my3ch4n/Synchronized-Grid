"use client";

import { useRoomStore } from "../model/store";
import { useInviteLink } from "@shared/hooks/useInviteLink";

export function InviteButton() {
  const workspaceId = useRoomStore((s) => s.workspaceId);
  const { copied, loading, copyInviteLink } = useInviteLink(workspaceId ?? "");

  if (!workspaceId) {
    return null;
  }

  return (
    <button
      onClick={copyInviteLink}
      disabled={loading}
      className="glass-surface px-3 py-1.5 text-xs rounded-glass text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors disabled:opacity-50"
    >
      {loading ? "생성 중..." : copied ? "링크 복사됨!" : "초대"}
    </button>
  );
}
