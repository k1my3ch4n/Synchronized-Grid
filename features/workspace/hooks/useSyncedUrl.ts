import { useWorkspaceContext } from "./useWorkspaceContext";
import { useUrlStore } from "@features/url-input/model/store";
import { useWorkspaceStore } from "../model/store";

export function useSyncedUrl() {
  const { isInWorkspace } = useWorkspaceContext();
  const urlStore = useUrlStore();
  const workspaceStore = useWorkspaceStore();
  const role = workspaceStore.currentUser?.role;
  const canEdit = !isInWorkspace || role === "OWNER" || role === "EDITOR";

  if (isInWorkspace) {
    return {
      canEdit,
      url: urlStore.url,
      setUrl: workspaceStore.syncChangeUrl,
    };
  }

  return { ...urlStore, canEdit };
}
