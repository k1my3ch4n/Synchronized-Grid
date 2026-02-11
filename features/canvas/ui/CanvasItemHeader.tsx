import { GRID_SIZE } from "@shared/constants";
import { DraggableAttributes } from "@dnd-kit/core";

interface CanvasItemHeaderProps {
  label: string;
  width: number;
  listeners: Record<string, unknown>;
  attributes: DraggableAttributes;
  onRemove: () => void;
}

export function CanvasItemHeader({
  label,
  width,
  listeners,
  attributes,
  onRemove,
}: CanvasItemHeaderProps) {
  return (
    <div
      {...listeners}
      {...attributes}
      className="flex items-center justify-between px-2 py-1 bg-gray-700 text-white text-xs rounded-t cursor-grab"
      style={{ width, height: GRID_SIZE }}
    >
      <span>{label}</span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="ml-2 hover:text-red-400"
      >
        ✕
      </button>
    </div>
  );
}
