"use client";

import { useDraggable } from "@dnd-kit/core";
import { Viewport } from "@shared/types";

interface PaletteItemProps {
  viewport: Viewport;
}

export function PaletteItem({ viewport }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${viewport.id}`,
    data: { viewport, fromPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0.3 : 1,
      }}
      className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-sm   transition-all"
    >
      <div className="font-medium text-sm">{viewport.label}</div>
      <div className="text-xs text-gray-500">
        {viewport.width} × {viewport.height}
      </div>
    </div>
  );
}
