import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { useUrlStore } from "@features/url-input";
import { useResize } from "../hooks/useResize";
import { CanvasItemHeader } from "./CanvasItemHeader";
import { toast } from "sonner";

import { CANVAS_SCALE } from "@shared/constants";
import { ResizeHandle } from "@shared/ui/ResizeHandle";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { canEdit, addViewport, removeViewport, updateSize, updateZIndex } =
    useSyncedCanvas();

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

  return (
    <div
      ref={setNodeRef}
      className="absolute glass-card"
      style={{
        left: item.x,
        top: item.y,
        zIndex: item.zIndex,
        visibility: isDragging ? "hidden" : "visible",
      }}
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

      <div
        className="relative"
        style={{
          width: displayWidth * CANVAS_SCALE,
          height: displayHeight * CANVAS_SCALE,
        }}
      >
        <div className="absolute inset-0 z-10" />
        {isResizing && <div className="absolute inset-0 z-20" />}
        <ViewportFrame
          id={item.id}
          url={url}
          width={displayWidth}
          height={displayHeight}
          label={item.label}
          scale={CANVAS_SCALE}
          onSizeChange={(w, h) => updateSize(item.id, w, h)}
        />
        {canEdit && <ResizeHandle onPointerDown={handleResizePointerDown} />}
      </div>
    </div>
  );
}
