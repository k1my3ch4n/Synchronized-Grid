"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
} from "@dnd-kit/core";
import { Palette, Canvas, useCanvasStore } from "@features/canvas";
import { Viewport, CanvasViewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { CANVAS_SCALE } from "@shared/constants";

export function CanvasEditor() {
  const { addViewport, updatePosition } = useCanvasStore();
  const [activePalette, setActivePalette] = useState<Viewport | null>(null);
  const [activeCanvas, setActiveCanvas] = useState<CanvasViewport | null>(null);

  const pointerPosition = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const handleDragMove = (event: DragMoveEvent) => {
    const { activatorEvent, delta } = event;

    if (activatorEvent instanceof PointerEvent) {
      pointerPosition.current = {
        x: activatorEvent.clientX + delta.x,
        y: activatorEvent.clientY + delta.y,
      };
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, delta } = event;

    const data = event.active.data.current;

    if (data?.fromPalette && over?.id === "canvas") {
      const viewport = data.viewport;

      const canvasRect = canvasRef.current?.getBoundingClientRect();

      if (canvasRect) {
        const x = pointerPosition.current.x - canvasRect.left;
        const y = pointerPosition.current.y - canvasRect.top;

        addViewport({
          presetId: viewport.id,
          label: viewport.label,
          width: viewport.width,
          height: viewport.height,
          x: Math.max(0, x),
          y: Math.max(0, y),
        });
      }
    }

    if (data?.fromCanvas) {
      const item = data.item;
      updatePosition(
        item.id,
        Math.max(0, item.x + delta.x),
        Math.max(0, item.y + delta.y),
      );
    }

    setActivePalette(null);
    setActiveCanvas(null);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-120px)]">
        <Palette />
        <Canvas ref={canvasRef} />
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
