import { useEffect } from "react";
import { useCanvasStore } from "@features/canvas/model/store";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { showViewportDeletedToast } from "@features/canvas/lib/toast";
import { isFormElement } from "@shared/lib/dom";

export function useCanvasKeyboard() {
  const { canEdit, removeViewport, addViewport } = useSyncedCanvas();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFormElement(e.target)) {
        return;
      }

      const { selectedViewportId, selectViewport, viewport } =
        useCanvasStore.getState();

      if (e.key === "Escape" && selectedViewportId) {
        selectViewport(null);
        return;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedViewportId &&
        canEdit
      ) {
        const item = viewport.find((v) => v.id === selectedViewportId);
        if (item) {
          removeViewport(item.id);
          showViewportDeletedToast(item, () => addViewport(item));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, removeViewport, addViewport]);
}
