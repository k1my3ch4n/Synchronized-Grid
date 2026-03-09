"use client";

import { DndContext } from "@dnd-kit/core";
import { Palette, Canvas } from "@features/canvas";
import { useCanvasDnd } from "../hooks/useCanvasDnd";
import { snapToGridModifier } from "../lib/snapToGrid";
import { CanvasOverlay } from "./CanvasOverlay";

export function CanvasEditor() {
  const {
    sensors,
    canvasRef,
    activePalette,
    activeCanvas,
    handleDragStart,
    handleDragEnd,
  } = useCanvasDnd();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[snapToGridModifier]}
    >
      <div className="flex page-height">
        <Palette />
        <Canvas ref={canvasRef} />
      </div>

      <CanvasOverlay
        activePalette={activePalette}
        activeCanvas={activeCanvas}
      />
    </DndContext>
  );
}
