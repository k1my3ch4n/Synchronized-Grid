"use client";

import { forwardRef, useCallback, useMemo } from "react";
import throttle from "lodash.throttle";
import { useDroppable } from "@dnd-kit/core";
import { useCanvasStore } from "../model/store";
import { CanvasItem } from "./CanvasItem";
import { GRID_SIZE } from "@shared/constants";
import { useRoomContext } from "@features/room/hooks/useRoomContext";
import { RemoteCursors } from "@features/room/ui/RemoteCursors";
import { getSocket } from "@shared/lib/socket";

export const Canvas = forwardRef<HTMLDivElement>(function Canvas(_, ref) {
  const { viewport } = useCanvasStore();
  const { isInRoom } = useRoomContext();

  const throttledEmit = useMemo(
    () =>
      throttle((x: number, y: number) => {
        getSocket().emit("cursor:move", { x, y });
      }, 50),
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isInRoom) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + e.currentTarget.scrollLeft;
      const y = e.clientY - rect.top + e.currentTarget.scrollTop;

      throttledEmit(x, y);
    },
    [isInRoom, throttledEmit],
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
        isOver ? "bg-blue-50" : "bg-gray-100"
      }`}
      style={{
        backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
    >
      {viewport.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          뷰포트를 드래그해서 추가하세요
        </div>
      )}
      {viewport.map((item) => (
        <CanvasItem key={item.id} item={item} />
      ))}
      {isInRoom && <RemoteCursors />}
    </div>
  );
});
