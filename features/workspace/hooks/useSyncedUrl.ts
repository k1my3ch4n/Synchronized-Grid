import { useUrlStore } from "@features/url-input/model/store";
import { useWorkspaceStore } from "../model/store";
import { EDIT_ROLES } from "@shared/constants";

export function useSyncedUrl() {
  const urlStore = useUrlStore();
  const workspaceStore = useWorkspaceStore();
  const isInWorkspace = !!workspaceStore.workspaceId;
  const role = workspaceStore.currentUser?.role;
  const canEdit = !isInWorkspace || (!!role && EDIT_ROLES.includes(role));

  if (isInWorkspace) {
    return {
      canEdit,
      url: urlStore.url,
      setUrl: workspaceStore.syncChangeUrl,
    };
  }

  return { ...urlStore, canEdit };
}
