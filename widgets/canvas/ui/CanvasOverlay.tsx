import { DragOverlay } from "@dnd-kit/core";
import { Viewport, CanvasViewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { CANVAS_SCALE, GRID_SIZE } from "@shared/constants";
import { snapToGrid } from "@shared/lib/grid";

interface CanvasOverlayProps {
  activePalette: Viewport | null;
  activeCanvas: CanvasViewport | null;
}

export function CanvasOverlay({
  activePalette,
  activeCanvas,
}: CanvasOverlayProps) {
  return (
    <DragOverlay dropAnimation={null}>
      {activePalette && (
        <ViewportCard viewport={activePalette} variant="overlay" />
      )}

      {activeCanvas && (
        <div
          className="glass-card"
          style={{
            width: snapToGrid(activeCanvas.width * CANVAS_SCALE),
            height: snapToGrid(GRID_SIZE + activeCanvas.height * CANVAS_SCALE),
            border: "none",
            boxShadow:
              "inset 0 0 0 1px var(--glass-border), 0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <ViewportCard viewport={activeCanvas} variant="header" />
          <div
            className="flex items-center justify-center text-xs bg-black/20 text-text-muted"
            style={{ height: activeCanvas.height * CANVAS_SCALE }}
          >
            {activeCanvas.width} × {activeCanvas.height}
          </div>
        </div>
      )}
    </DragOverlay>
  );
}
