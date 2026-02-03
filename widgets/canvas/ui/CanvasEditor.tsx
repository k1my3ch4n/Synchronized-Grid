"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Palette, Canvas, useCanvasStore } from "@features/canvas";

export function CanvasEditor() {
  const { addViewport, updatePosition } = useCanvasStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!over) return;

    const data = active.data.current;

    if (data?.fromPalette && over.id === "canvas") {
      const viewport = data.viewport;
      addViewport({
        presetId: viewport.id,
        label: viewport.label,
        width: viewport.width,
        height: viewport.height,
        x:
          event.activatorEvent instanceof MouseEvent
            ? event.activatorEvent.clientX
            : 100,
        y:
          event.activatorEvent instanceof MouseEvent
            ? event.activatorEvent.clientY
            : 100,
      });
    }

    if (data?.fromCanvas) {
      const item = data.item;
      updatePosition(item.id, item.x + delta.x, item.y + delta.y);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen">
        <Palette />
        <Canvas />
      </div>
    </DndContext>
  );
}
