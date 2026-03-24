import { useDraggable } from "@dnd-kit/core";
import { Viewport } from "@shared/types";
import { CloseButton } from "@shared/ui/CloseButton";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { usePresetStore } from "@entities/viewport";
import { useCanvasStore } from "@features/canvas/model/store";
import { GRID_SIZE } from "@shared/constants";

interface PaletteItemProps {
  viewport: Viewport;
}

export function PaletteItem({ viewport }: PaletteItemProps) {
  const { addViewport, canEdit } = useSyncedCanvas();
  const { removePreset } = usePresetStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${viewport.id}`,
    data: { viewport, fromPalette: true },
    disabled: !canEdit,
  });

  const handleViewportClick = () => {
    if (isDragging) {
      return;
    }

    const existing = useCanvasStore.getState().viewport;
    const occupied = new Set(existing.map((v) => `${v.x},${v.y}`));

    let step = 0;
    while (occupied.has(`${step * GRID_SIZE},${step * GRID_SIZE}`)) {
      step++;
    }

    addViewport({
      presetId: viewport.id,
      label: viewport.label,
      width: viewport.width,
      height: viewport.height,
      x: step * GRID_SIZE,
      y: step * GRID_SIZE,
    });
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleViewportClick}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="cursor-grab relative group transition-opacity duration-150"
    >
      <ViewportCard viewport={viewport} variant="palette" />
      <CloseButton
        onClick={() => removePreset(viewport.id)}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}
