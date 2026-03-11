"use client";

import { useState } from "react";
import { useRoomStore } from "../model/store";

export function InviteButton() {
  const workspaceId = useRoomStore((s) => s.workspaceId);
  const [copied, setCopied] = useState(false);

  if (!workspaceId) return null;

  const handleInvite = async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
      });

      const data = await res.json();

      if (data.token) {
        const url = `${window.location.origin}/invite/${data.token}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // 복사 실패 시 무시
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="glass-surface px-3 py-1.5 text-xs rounded-glass text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-colors"
    >
      {copied ? "링크 복사됨!" : "초대"}
    </button>
  );
}
