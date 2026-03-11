"use client";

import { useState } from "react";
import { toast } from "sonner";

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
        toast.success("초대 링크가 복사되었습니다");
      }
    } catch {
      toast.error("초대 링크 복사에 실패했습니다");
    }
  };

  return { copied, copyInviteLink };
}
