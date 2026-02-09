"use client";

import { useDraggable } from "@dnd-kit/core";
import { Viewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";

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
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="cursor-grab"
    >
      <ViewportCard viewport={viewport} variant="palette" />
    </div>
  );
}
