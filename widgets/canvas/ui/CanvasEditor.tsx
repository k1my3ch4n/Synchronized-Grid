"use client";

import { DndContext } from "@dnd-kit/core";
import { Palette, Canvas } from "@features/canvas";
import { useCanvasDnd } from "../hooks/useCanvasDnd";
import { snapToGridModifier } from "../lib/snapToGrid";
import { CanvasOverlay } from "./CanvasOverlay";

export function CanvasEditor() {
  const {
    canvasRef,
    activePalette,
    activeCanvas,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  } = useCanvasDnd();

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      modifiers={[snapToGridModifier]}
    >
      <div className="flex h-[calc(100vh-120px)]">
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
