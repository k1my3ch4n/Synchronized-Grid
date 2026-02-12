import { GRID_SIZE } from "@shared/constants";
import { DraggableAttributes } from "@dnd-kit/core";

interface CanvasItemHeaderProps {
  label: string;
  width: number;
  height: number;
  listeners: Record<string, unknown>;
  attributes: DraggableAttributes;
  onRemove: () => void;
}

export function CanvasItemHeader({
  label,
  width,
  height,
  listeners,
  attributes,
  onRemove,
}: CanvasItemHeaderProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      className="flex items-center justify-between px-1.5 cursor-grab select-none bg-linear-to-r
                from-win98-title-from to-win98-title-to text-white text-[11px] font-bold"
      style={{ height: GRID_SIZE }}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-[10px] text-white/70">
          {width}×{height}
        </span>
      </div>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-3.5 text-black text-[10px] leading-none bg-win98-gray win98-btn"
      >
        ✕
      </button>
    </div>
  );
}
