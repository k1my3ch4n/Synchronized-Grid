import { useDraggable } from "@dnd-kit/core";
import { Viewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { useCanvasStore } from "../model/store";

interface PaletteItemProps {
  viewport: Viewport;
}

export function PaletteItem({ viewport }: PaletteItemProps) {
  const { addViewport } = useCanvasStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${viewport.id}`,
    data: { viewport, fromPalette: true },
  });

  // todo : 0,0 -> 1,1 같은 식으로 등장하는 위치 변경
  const handleClick = () => {
    if (isDragging) {
      return;
    }

    addViewport({
      presetId: viewport.id,
      label: viewport.label,
      width: viewport.width,
      height: viewport.height,
      x: 0,
      y: 0,
    });
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="cursor-grab"
    >
      <ViewportCard viewport={viewport} variant="palette" />
    </div>
  );
}
