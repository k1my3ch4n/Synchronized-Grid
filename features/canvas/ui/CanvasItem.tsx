import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useSyncedCanvas } from "@features/room/hooks/useSyncedCanvas";
import { useUrlStore } from "@features/url-input";
import { useResize } from "../hooks/useResize";
import { CanvasItemHeader } from "./CanvasItemHeader";

import { CANVAS_SCALE } from "@shared/constants";
import { ResizeHandle } from "@shared/ui/ResizeHandle";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { removeViewport, updateSize, updateZIndex } = useSyncedCanvas();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item, fromCanvas: true },
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
      className="absolute"
      style={{
        left: item.x,
        top: item.y,
        zIndex: item.zIndex,
        visibility: isDragging ? "hidden" : "visible",
      }}
      onPointerDown={() => updateZIndex(item.id)}
    >
      <CanvasItemHeader
        label={item.label}
        width={displayWidth}
        height={displayHeight}
        listeners={listeners ?? {}}
        attributes={attributes}
        onRemove={() => removeViewport(item.id)}
      />

      <div
        className="relative"
        style={{
          width: displayWidth * CANVAS_SCALE,
          height: displayHeight * CANVAS_SCALE,
        }}
      >
        {isResizing && <div className="absolute inset-0 z-10" />}
        <ViewportFrame
          url={url}
          width={displayWidth}
          height={displayHeight}
          label={item.label}
          scale={CANVAS_SCALE}
          onSizeChange={(w, h) => updateSize(item.id, w, h)}
        />
        <ResizeHandle onPointerDown={handleResizePointerDown} />
      </div>
    </div>
  );
}
