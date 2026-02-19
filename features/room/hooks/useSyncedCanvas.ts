import { useRoomContext } from "./useRoomContext";
import { useCanvasStore } from "@features/canvas/model/store";
import { useRoomStore } from "../model/store";

export function useSyncedCanvas() {
  const { isInRoom } = useRoomContext();

  const canvasStore = useCanvasStore();
  const roomStore = useRoomStore();

  if (isInRoom) {
    return {
      viewport: canvasStore.viewport,
      addViewport: roomStore.syncAddViewport,
      updatePosition: roomStore.syncUpdatePosition,
      updateSize: roomStore.syncUpdateSize,
      removeViewport: roomStore.syncRemoveViewport,
      updateZIndex: roomStore.syncUpdateZIndex,
    };
  }

  return canvasStore;
}
