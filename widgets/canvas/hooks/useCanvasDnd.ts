import { useState, useRef } from "react";
import { DragEndEvent, DragStartEvent, DragMoveEvent } from "@dnd-kit/core";
import { useCanvasStore } from "@features/canvas";
import { Viewport, CanvasViewport } from "@shared/types";
import { snapToGrid } from "../lib/snapToGrid";

export function useCanvasDnd() {
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
          x: snapToGrid(x),
          y: snapToGrid(y),
        });
      }
    }

    if (data?.fromCanvas) {
      const item = data.item;
      updatePosition(
        item.id,
        snapToGrid(item.x + delta.x),
        snapToGrid(item.y + delta.y),
      );
    }

    setActivePalette(null);
    setActiveCanvas(null);
  };

  return {
    canvasRef,
    activePalette,
    activeCanvas,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}
