import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useCanvasStore } from "../model/store";
import { useUrlStore } from "@features/url-input";

import { CANVAS_SCALE, GRID_SIZE } from "@shared/constants";
import { useCallback, useRef } from "react";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { removeViewport, updateSize } = useCanvasStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item, fromCanvas: true },
  });

  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      isResizing.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { width: item.width, height: item.height };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isResizing.current) {
          return;
        }

        const deltaX = (moveEvent.clientX - startPos.current.x) / CANVAS_SCALE;
        const deltaY = (moveEvent.clientY - startPos.current.y) / CANVAS_SCALE;

        const newWidth =
          Math.round(
            Math.max(GRID_SIZE, startSize.current.width + deltaX) / GRID_SIZE,
          ) * GRID_SIZE;

        const newHeight =
          Math.round(
            Math.max(GRID_SIZE, startSize.current.height + deltaY) / GRID_SIZE,
          ) * GRID_SIZE;

        updateSize(item.id, newWidth, newHeight);
      };

      const handlePointerUp = () => {
        isResizing.current = false;
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [item.id, item.width, item.height, updateSize],
  );

  const style = {
    position: "absolute" as const,
    left: item.x,
    top: item.y,
    visibility: isDragging ? ("hidden" as const) : ("visible" as const),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-between px-2 py-1 bg-gray-700 text-white text-xs rounded-t 
  cursor-grab"
        style={{ width: item.width * CANVAS_SCALE, height: GRID_SIZE }}
      >
        <span>{item.label}</span>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => removeViewport(item.id)}
          className="ml-2 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      <div className="relative">
        <ViewportFrame
          url={url}
          width={item.width}
          height={item.height}
          label=""
          scale={CANVAS_SCALE}
        />
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl"
          title="드래그하여 크기 조절"
        />
      </div>
    </div>
  );
}
