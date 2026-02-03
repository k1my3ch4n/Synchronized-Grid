"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { Palette, Canvas, useCanvasStore } from "@features/canvas";
import { Viewport, CanvasViewport } from "@shared/types";

import { ViewportCard } from "@shared/ui/ViewportCard";
import { CANVAS_SCALE } from "@shared/constants";

export function CanvasEditor() {
  const { addViewport, updatePosition } = useCanvasStore();
  const [activePalette, setActivePalette] = useState<Viewport | null>(null);
  const [activeCanvas, setActiveCanvas] = useState<CanvasViewport | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.fromPalette) {
      setActivePalette(data.viewport);
      setActiveCanvas(null);
    }
    if (data?.fromCanvas) {
      setActiveCanvas(data.item);
      setActivePalette(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePalette(null);
    setActiveCanvas(null);

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
        x: Math.max(0, delta.x + 200),
        y: Math.max(0, delta.y + 100),
      });
    }

    if (data?.fromCanvas) {
      const item = data.item;
      updatePosition(
        item.id,
        Math.max(0, item.x + delta.x),
        Math.max(0, item.y + delta.y),
      );
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[calc(100vh-120px)]">
        <Palette />
        <Canvas />
      </div>

      <DragOverlay dropAnimation={null}>
        {activePalette && (
          <ViewportCard viewport={activePalette} variant="overlay" />
        )}

        {activeCanvas && (
          <div
            className="bg-white border-2 border-blue-400 rounded shadow-lg"
            style={{ width: activeCanvas.width * CANVAS_SCALE }}
          >
            <ViewportCard viewport={activeCanvas} variant="header" />
            <div
              className="bg-gray-100 flex items-center justify-center text-xs text-gray-400"
              style={{ height: activeCanvas.height * CANVAS_SCALE }}
            >
              {activeCanvas.width} × {activeCanvas.height}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
