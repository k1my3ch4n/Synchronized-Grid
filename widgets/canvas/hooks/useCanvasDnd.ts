import { useState, useRef } from "react";
import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { Viewport, CanvasViewport } from "@shared/types";
import { snapToGrid } from "@shared/lib/grid";
import { DND_ACTIVATION_DISTANCE } from "@shared/constants";

export function useCanvasDnd() {
  const { addViewport, updatePosition } = useSyncedCanvas();
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
      const initialRect = event.active.rect.current.initial;

      if (
        canvasRect &&
        canvas &&
        initialRect &&
        activatorEvent instanceof PointerEvent
      ) {
        const grabOffsetX = activatorEvent.clientX - initialRect.left;
        const grabOffsetY = activatorEvent.clientY - initialRect.top;

        const x =
          activatorEvent.clientX +
          delta.x -
          grabOffsetX -
          canvasRect.left +
          canvas.scrollLeft;

        const y =
          activatorEvent.clientY +
          delta.y -
          grabOffsetY -
          canvasRect.top +
          canvas.scrollTop;

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
      activationConstraint: { distance: DND_ACTIVATION_DISTANCE },
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
