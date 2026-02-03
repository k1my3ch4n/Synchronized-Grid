"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CanvasViewport } from "@shared/types";
import { useCanvasStore } from "../model/store";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { removeViewport } = useCanvasStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      data: { item, fromCanvas: true },
    });

  const style = {
    position: "absolute" as const,
    left: item.x,
    top: item.y,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    width: item.width * 0.3, // 축소 비율
    height: item.height * 0.3,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border-2 border-gray-300 rounded-lg shadow-lg cursor-grab"
    >
      <div
        {...listeners}
        {...attributes}
        className="flex items-center justify-between p-2 bg-gray-100 border-b"
      >
        <span className="text-xs font-medium">{item.label}</span>
        <button
          onClick={() => removeViewport(item.id)}
          className="text-red-500 hover:text-red-700 text-xs"
        >
          ✕
        </button>
      </div>

      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
        <span className="text-xs text-gray-400">
          {item.width} × {item.height}
        </span>
      </div>
    </div>
  );
}
