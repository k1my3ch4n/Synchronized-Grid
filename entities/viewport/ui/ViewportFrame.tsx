"use client";

import { useCallback, useEffect, useRef } from "react";
import { SizeInput } from "@shared/ui/SizeInput";
import { useScrollSyncStore } from "@features/scroll-sync";

interface ViewportFrameProps {
  id: string;
  url: string;
  width: number;
  height: number;
  label: string;
  scale?: number;
  onSizeChange?: (width: number, height: number) => void;
}

export function ViewportFrame({
  id,
  url,
  width,
  height,
  label,
  scale = 0.3,
  onSizeChange,
}: ViewportFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { registerFrame, unregisterFrame } = useScrollSyncStore();

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    registerFrame(id, iframe);
    iframe.contentWindow?.postMessage({ type: "proxy:init", frameId: id }, "*");
  }, [id, registerFrame]);

  useEffect(() => {
    return () => unregisterFrame(id);
  }, [id, unregisterFrame]);

  return (
    <div className="relative">
      <div
        className="overflow-hidden bg-white rounded-b-2xl relative"
        style={{
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        }}
      >
        {!url && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a12] z-10">
            <div className="text-center">
              <div className="text-2xl mb-2 opacity-40">&#127760;</div>
              <p className="text-xs text-text-muted">URL을 입력해 주세요</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={
            url ? `/api/proxy?url=${encodeURIComponent(url)}` : "about:blank"
          }
          width={width}
          height={height}
          className="border-0 origin-top-left"
          style={{ transform: `scale(${scale})` }}
          title={label}
          onLoad={url ? handleLoad : undefined}
        />
      </div>
      {label && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-sm font-medium text-text-secondary whitespace-nowrap flex items-center gap-1">
          <span>{label}</span>
          {onSizeChange ? (
            <SizeInput
              width={width}
              height={height}
              onSizeChange={onSizeChange}
            />
          ) : (
            <span>
              ({width}x{height})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
