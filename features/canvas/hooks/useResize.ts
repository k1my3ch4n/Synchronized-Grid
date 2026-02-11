import { useCallback, useRef, useState } from "react";
import { CANVAS_SCALE } from "@shared/constants";
import { snapToGridWithMinimum } from "@shared/lib/grid";

interface UseResizeParams {
  id: string;
  width: number;
  height: number;
  onResizeEnd: (id: string, width: number, height: number) => void;
}

export function useResize({ id, width, height, onResizeEnd }: UseResizeParams) {
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ width: 0, height: 0 });
  const rafId = useRef<number>(0);

  const previewSizeRef = useRef<{ width: number; height: number } | null>(null);

  const [previewSize, setPreviewSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      isResizing.current = true;
      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { width, height };

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!isResizing.current) {
          return;
        }

        cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
          const deltaX =
            (moveEvent.clientX - startPos.current.x) / CANVAS_SCALE;
          const deltaY =
            (moveEvent.clientY - startPos.current.y) / CANVAS_SCALE;

          const newWidth = snapToGridWithMinimum(
            startSize.current.width + deltaX,
          );

          const newHeight = snapToGridWithMinimum(
            startSize.current.height + deltaY,
          );

          const newSize = { width: newWidth, height: newHeight };

          previewSizeRef.current = newSize;
          setPreviewSize(newSize);
        });
      };

      const handlePointerUp = () => {
        isResizing.current = false;
        cancelAnimationFrame(rafId.current);

        const finalSize = previewSizeRef.current;
        previewSizeRef.current = null;
        setPreviewSize(null);

        if (finalSize) {
          onResizeEnd(id, finalSize.width, finalSize.height);
        }

        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
    [id, width, height, onResizeEnd],
  );

  return {
    displayWidth: previewSize?.width ?? width,
    displayHeight: previewSize?.height ?? height,
    isResizing: previewSize !== null,
    handleResizePointerDown,
  };
}
