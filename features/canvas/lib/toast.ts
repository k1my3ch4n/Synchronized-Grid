import { toast } from "sonner";
import { CanvasViewport } from "@shared/types";

export function showViewportDeletedToast(
  item: CanvasViewport,
  onUndo: () => void,
) {
  toast(`"${item.label}" 뷰포트가 삭제되었습니다`, {
    action: { label: "되돌리기", onClick: onUndo },
  });
}
