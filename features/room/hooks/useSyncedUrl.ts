import { useRoomContext } from "./useRoomContext";
import { useUrlStore } from "@features/url-input/model/store";
import { useRoomStore } from "../model/store";

export function useSyncedUrl() {
  const { isInRoom } = useRoomContext();
  const urlStore = useUrlStore();
  const { syncChangeUrl } = useRoomStore();

  if (isInRoom) {
    return {
      url: urlStore.url,
      setUrl: syncChangeUrl,
    };
  }

  return urlStore;
}
