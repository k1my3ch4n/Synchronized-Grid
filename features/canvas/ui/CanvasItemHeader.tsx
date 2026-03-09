import { GRID_SIZE } from "@shared/constants";
import { DraggableAttributes } from "@dnd-kit/core";
import { CloseButton } from "@shared/ui/CloseButton";

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
      className="flex items-center justify-between px-3 cursor-grab select-none
                bg-white/[0.03] border-b border-glass-border text-label font-medium"
      style={{ height: GRID_SIZE }}
    >
      <div className="flex items-center gap-2">
        <span className="text-text-primary">{label}</span>
        <span className="text-caption text-text-secondary font-mono">
          {width}×{height}
        </span>
      </div>
      <CloseButton onClick={onRemove} />
    </div>
  );
}
