import { useState, useRef } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useCanvasStore } from "@features/canvas";
import { Viewport, CanvasViewport } from "@shared/types";
import { snapToGrid } from "@shared/lib/grid";

export function useCanvasDnd() {
  const { addViewport, updatePosition } = useCanvasStore();
  const [activePalette, setActivePalette] = useState<Viewport | null>(null);
  const [activeCanvas, setActiveCanvas] = useState<CanvasViewport | null>(null);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, delta, activatorEvent } = event;
    const data = event.active.data.current;

    if (data?.fromPalette && over?.id === "canvas") {
      const viewport = data.viewport;
      const canvas = canvasRef.current;
      const canvasRect = canvas?.getBoundingClientRect();

      if (canvasRect && canvas && activatorEvent instanceof PointerEvent) {
        const x =
          activatorEvent.clientX +
          delta.x -
          canvasRect.left +
          canvas.scrollLeft;

        const y =
          activatorEvent.clientY + delta.y - canvasRect.top + canvas.scrollTop;

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  return {
    sensors,
    canvasRef,
    activePalette,
    activeCanvas,
    handleDragStart,
    handleDragEnd,
  };
}
