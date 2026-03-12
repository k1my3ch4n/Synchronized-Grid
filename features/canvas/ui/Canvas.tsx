"use client";

import { forwardRef, useCallback, useMemo } from "react";
import throttle from "lodash.throttle";
import { useDroppable } from "@dnd-kit/core";
import { useCanvasStore } from "../model/store";
import { CanvasItem } from "./CanvasItem";
import { GRID_SIZE, THROTTLE_CURSOR_MS } from "@shared/constants";
import { useWorkspaceContext } from "@features/workspace/hooks/useWorkspaceContext";
import { RemoteCursors } from "@features/workspace/ui/RemoteCursors";
import { getSocket } from "@shared/lib/socket";

export const Canvas = forwardRef<HTMLDivElement>(function Canvas(_, ref) {
  const { viewport } = useCanvasStore();
  const { isInWorkspace } = useWorkspaceContext();

  const throttledEmit = useMemo(
    () =>
      throttle((x: number, y: number) => {
        getSocket().emit("cursor:move", { x, y });
      }, THROTTLE_CURSOR_MS),
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isInWorkspace) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;

      throttledEmit(x, y);
    },
    [isInWorkspace, throttledEmit],
  );

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  const setRefs = (node: HTMLDivElement) => {
    setNodeRef(node);

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div
      ref={setRefs}
      onPointerMove={handlePointerMove}
      className={`flex-1 relative overflow-auto transition-colors ${
        isOver ? "bg-accent/5" : ""
      }`}
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    >
      {viewport.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="text-2xl opacity-30">⊞</span>
          <p className="text-sm text-text-muted">
            뷰포트를 드래그해서 추가하세요
          </p>
          <p className="text-caption text-text-muted/60">
            또는 좌측 패널에서 클릭
          </p>
        </div>
      )}
      {viewport.map((item) => (
        <CanvasItem key={item.id} item={item} />
      ))}
      {isInWorkspace && <RemoteCursors />}
    </div>
  );
});
