import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useCanvasStore } from "../model/store";
import { useUrlStore } from "@features/url-input";

import { CANVAS_SCALE } from "@shared/constants";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { removeViewport } = useCanvasStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item, fromCanvas: true },
  });

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
        style={{ width: item.width * CANVAS_SCALE }}
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

      <ViewportFrame
        url={url}
        width={item.width}
        height={item.height}
        label=""
        scale={CANVAS_SCALE}
      />
    </div>
  );
}
