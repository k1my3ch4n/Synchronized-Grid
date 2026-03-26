import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { useUrlStore } from "@features/url-input";
import { useResize } from "../hooks/useResize";
import { CanvasItemHeader } from "./CanvasItemHeader";
import { toast } from "sonner";

import { CANVAS_SCALE, GRID_SIZE } from "@shared/constants";
import { ResizeHandle } from "@shared/ui/ResizeHandle";
import { useCanvasStore } from "../model/store";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { canEdit, addViewport, removeViewport, updateSize, updateZIndex } =
    useSyncedCanvas();
  const isSelected = useCanvasStore((s) => s.selectedViewportId === item.id);
  const selectViewport = useCanvasStore((s) => s.selectViewport);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item, fromCanvas: true },
    disabled: !canEdit,
  });

  const { displayWidth, displayHeight, isResizing, handleResizePointerDown } =
    useResize({
      id: item.id,
      width: item.width,
      height: item.height,
      onResizeEnd: updateSize,
    });

  const cardWidth = Math.ceil(displayWidth * CANVAS_SCALE);
  const cardHeight = Math.ceil(GRID_SIZE + displayHeight * CANVAS_SCALE);

  return (
    <div
      ref={setNodeRef}
      className="absolute glass-card"
      style={{
        left: item.x,
        top: item.y,
        width: cardWidth,
        height: cardHeight,
        zIndex: item.zIndex,
        visibility: isDragging ? "hidden" : "visible",
        border: "none",
        boxShadow: isSelected
          ? "inset 0 0 0 2px var(--accent), 0 8px 32px rgba(0,0,0,0.3)"
          : "inset 0 0 0 1px var(--glass-border), 0 8px 32px rgba(0,0,0,0.3)",
      }}
      onClick={() => selectViewport(item.id)}
      onPointerDownCapture={() => updateZIndex(item.id)}
    >
      <CanvasItemHeader
        label={item.label}
        width={displayWidth}
        height={displayHeight}
        listeners={canEdit ? (listeners ?? {}) : {}}
        attributes={canEdit ? attributes : {}}
        onRemove={
          canEdit
            ? () => {
                removeViewport(item.id);
                toast(`"${item.label}" 뷰포트가 삭제되었습니다`, {
                  action: {
                    label: "되돌리기",
                    onClick: () => addViewport(item),
                  },
                });
              }
            : undefined
        }
      />

      <div className="relative overflow-hidden" style={{ flex: 1 }}>
        <div className="absolute inset-0 z-10 pointer-events-none" />
        {isResizing && <div className="absolute inset-0 z-20" />}
        <ViewportFrame
          id={item.id}
          url={url}
          width={displayWidth}
          height={displayHeight}
          label=""
          scale={CANVAS_SCALE}
        />
      </div>
      {canEdit && <ResizeHandle onPointerDown={handleResizePointerDown} />}
    </div>
  );
}
