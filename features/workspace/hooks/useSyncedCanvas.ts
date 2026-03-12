import { useWorkspaceContext } from "./useWorkspaceContext";
import { useCanvasStore } from "@features/canvas/model/store";
import { useWorkspaceStore } from "../model/store";

export function useSyncedCanvas() {
  const { isInWorkspace } = useWorkspaceContext();

  const canvasStore = useCanvasStore();
  const workspaceStore = useWorkspaceStore();
  const role = workspaceStore.currentUser?.role;
  const canEdit = !isInWorkspace || role === "OWNER" || role === "EDITOR";

  if (isInWorkspace) {
    return {
      canEdit,
      viewport: canvasStore.viewport,
      addViewport: workspaceStore.syncAddViewport,
      updatePosition: workspaceStore.syncUpdatePosition,
      updateSize: workspaceStore.syncUpdateSize,
      removeViewport: workspaceStore.syncRemoveViewport,
      updateZIndex: workspaceStore.syncUpdateZIndex,
    };
  }

  return { ...canvasStore, canEdit };
}
