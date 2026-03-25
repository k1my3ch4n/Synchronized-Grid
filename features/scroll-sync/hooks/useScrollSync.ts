"use client";

import { useEffect } from "react";
import { useScrollSyncStore } from "../model/store";

interface ProxyScrollMessage {
  type: "proxy:scroll";
  frameId: string | null;
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
}

function isProxyScroll(data: unknown): data is ProxyScrollMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as ProxyScrollMessage).type === "proxy:scroll"
  );
}

export function useScrollSync() {
  const enabled = useScrollSyncStore((s) => s.enabled);
  const frameRefs = useScrollSyncStore((s) => s.frameRefs);

  useEffect(() => {
    if (!enabled) return;

    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!isProxyScroll(data)) return;

      const sourceId = data.frameId;
      if (!sourceId) return;

      const maxScroll = data.scrollHeight - data.clientHeight;
      if (maxScroll <= 0) return;

      const ratio = data.scrollY / maxScroll;

      frameRefs.forEach((iframe, id) => {
        if (id === sourceId) return;
        iframe.contentWindow?.postMessage(
          { type: "proxy:scrollTo", ratio },
          "*",
        );
      });
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [enabled, frameRefs]);
}
