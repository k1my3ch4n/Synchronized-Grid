"use client";

import { createContext, useContext } from "react";

interface WorkspaceContextType {
  isInWorkspace: boolean;
  workspaceId: string | null;
}

export const WorkspaceContext = createContext<WorkspaceContextType>({
  isInWorkspace: false,
  workspaceId: null,
});

export function useWorkspaceContext() {
  return useContext(WorkspaceContext);
}
