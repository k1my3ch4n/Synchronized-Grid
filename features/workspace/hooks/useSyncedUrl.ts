import { useWorkspaceContext } from "./useWorkspaceContext";
import { useUrlStore } from "@features/url-input/model/store";
import { useWorkspaceStore } from "../model/store";

export function useSyncedUrl() {
  const { isInWorkspace } = useWorkspaceContext();
  const urlStore = useUrlStore();
  const { syncChangeUrl } = useWorkspaceStore();

  if (isInWorkspace) {
    return {
      url: urlStore.url,
      setUrl: syncChangeUrl,
    };
  }

  return urlStore;
}
