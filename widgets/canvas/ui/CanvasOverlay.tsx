import { DragOverlay } from "@dnd-kit/core";
import { Viewport, CanvasViewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { CANVAS_SCALE } from "@shared/constants";

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
          className="bg-win98-gray win98-raised"
          style={{ width: activeCanvas.width * CANVAS_SCALE }}
        >
          <ViewportCard viewport={activeCanvas} variant="header" />
          <div
            className="flex items-center justify-center text-xs bg-white text-win98-text win98-sunken"
            style={{ height: activeCanvas.height * CANVAS_SCALE }}
          >
            {activeCanvas.width} × {activeCanvas.height}
          </div>
        </div>
      )}
    </DragOverlay>
  );
}
