"use client";

import { useState } from "react";

export function useInviteLink(workspaceId: string) {
  const [copied, setCopied] = useState(false);

  const copyInviteLink = async () => {
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

  return { copied, copyInviteLink };
}
