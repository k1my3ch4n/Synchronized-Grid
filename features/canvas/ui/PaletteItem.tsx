import { useDraggable } from "@dnd-kit/core";
import { Viewport } from "@shared/types";
import { ViewportCard } from "@shared/ui/ViewportCard";
import { useCanvasStore } from "../model/store";
import { usePresetStore } from "@/entities/viewport";

interface PaletteItemProps {
  viewport: Viewport;
}

export function PaletteItem({ viewport }: PaletteItemProps) {
  const { addViewport } = useCanvasStore();
  const { removePreset } = usePresetStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${viewport.id}`,
    data: { viewport, fromPalette: true },
  });

  // todo : 0,0 -> 1,1 같은 식으로 등장하는 위치 변경
  const handleViewportClick = () => {
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
      onClick={handleViewportClick}
      style={{ opacity: isDragging ? 0.3 : 1 }}
      className="cursor-grab relative"
    >
      <ViewportCard viewport={viewport} variant="palette" />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          removePreset(viewport.id);
        }}
        className="absolute top-1 right-1 w-4 h-3.5 flex items-center justify-center text-black text-[10px] leading-none bg-win98-gray win98-btn"
      >
        ✕
      </button>
    </div>
  );
}
