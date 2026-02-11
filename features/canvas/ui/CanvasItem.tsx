import { useDraggable } from "@dnd-kit/core";
import { CanvasViewport } from "@shared/types";
import { ViewportFrame } from "@entities/viewport";
import { useCanvasStore } from "../model/store";
import { useUrlStore } from "@features/url-input";
import { useResize } from "../hooks/useResize";
import { CanvasItemHeader } from "./CanvasItemHeader";

import { CANVAS_SCALE } from "@shared/constants";

interface CanvasItemProps {
  item: CanvasViewport;
}

export function CanvasItem({ item }: CanvasItemProps) {
  const { url } = useUrlStore();
  const { removeViewport, updateSize } = useCanvasStore();

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
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        visibility: isDragging ? "hidden" : "visible",
      }}
    >
      <CanvasItemHeader
        label={item.label}
        width={displayWidth * CANVAS_SCALE}
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
          label=""
          scale={CANVAS_SCALE}
        />
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize rounded-tl z-20"
          title="드래그하여 크기 조절"
        />
      </div>
    </div>
  );
}
