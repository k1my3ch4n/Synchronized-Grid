import { useEffect } from "react";
import { useCanvasStore } from "@features/canvas/model/store";
import { useSyncedCanvas } from "@features/workspace/hooks/useSyncedCanvas";
import { toast } from "sonner";

function isFormElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;

  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

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
          toast(`"${item.label}" 뷰포트가 삭제되었습니다`, {
            action: {
              label: "되돌리기",
              onClick: () => addViewport(item),
            },
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canEdit, removeViewport, addViewport]);
}
