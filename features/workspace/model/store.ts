import { create } from "zustand";
import {
  WorkspaceUser,
  CanvasViewport,
  WorkspaceJoinResult,
} from "@shared/types";
import { connectSocket, getSocket, disconnectSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas/model/store";
import { useUrlStore } from "@features/url-input/model/store";
import { setupSocketListeners } from "./socket-listeners";

export interface WorkspaceStoreState {
  workspaceId: string | null;
  workspaceName: string | null;
  isConnected: boolean;
  currentUser: WorkspaceUser | null;
  users: WorkspaceUser[];
  error: string | null;

  joinWorkspace: (workspaceId: string) => void;
  leaveWorkspace: () => void;

  syncAddViewport: (viewport: Omit<CanvasViewport, "id" | "zIndex">) => void;
  syncUpdatePosition: (id: string, x: number, y: number) => void;
  syncUpdateSize: (id: string, width: number, height: number) => void;
  syncRemoveViewport: (id: string) => void;
  syncUpdateZIndex: (id: string) => void;
  syncChangeUrl: (url: string) => void;
}

export const useWorkspaceStore = create<WorkspaceStoreState>((set, get) => ({
  workspaceId: null,
  workspaceName: null,
  isConnected: false,
  currentUser: null,
  users: [],
  error: null,

  joinWorkspace: (workspaceId) => {
    set({ error: null });
    const socket = connectSocket();

    const handleJoin = () => {
      socket.emit(
        "workspace:join",
        { workspaceId },
        (result: WorkspaceJoinResult) => {
          if ("error" in result) {
            set({ error: result.error });
            return;
          }

          set({
            workspaceId,
            workspaceName: result.state.name,
            isConnected: true,
            currentUser: result.user,
            users: result.state.users,
          });

          // 서버 상태로 Canvas Store 초기화
          useCanvasStore.setState({ viewport: result.state.viewports });

          if (result.state.url) {
            useUrlStore.getState().setUrl(result.state.url);
          }

          // 소켓 리스너 등록 (재연결 시에도 다시 등록)
          setupSocketListeners(socket, set);
        },
      );
    };

    // 최초 join
    handleJoin();

    // 재연결 시 자동으로 workspace에 다시 참가
    socket.on("connect", () => {
      const state = get();
      if (state.workspaceId) {
        handleJoin();
      }
    });
  },

  leaveWorkspace: () => {
    const socket = getSocket();
    socket.off("connect");
    disconnectSocket();
    set({
      workspaceId: null,
      workspaceName: null,
      isConnected: false,
      currentUser: null,
      users: [],
      error: null,
    });
  },

  syncAddViewport: (viewport) => {
    const viewports = useCanvasStore.getState().viewport;
    const maxZ = Math.max(...viewports.map((v) => v.zIndex), -1);

    const fullViewport: CanvasViewport = {
      ...viewport,
      id: crypto.randomUUID(),
      zIndex: maxZ + 1,
    };

    useCanvasStore.setState({
      viewport: [...viewports, fullViewport],
    });

    getSocket().emit("viewport:add", { viewport: fullViewport });
  },

  syncUpdatePosition: (id, x, y) => {
    useCanvasStore.getState().updatePosition(id, x, y);
    getSocket().emit("viewport:move", { id, x, y });
  },

  syncUpdateSize: (id, width, height) => {
    useCanvasStore.getState().updateSize(id, width, height);
    getSocket().emit("viewport:resize", { id, width, height });
  },

  syncRemoveViewport: (id) => {
    useCanvasStore.getState().removeViewport(id);
    getSocket().emit("viewport:remove", { id });
  },

  syncUpdateZIndex: (id) => {
    useCanvasStore.getState().updateZIndex(id);

    const viewport = useCanvasStore
      .getState()
      .viewport.find((v) => v.id === id);

    if (viewport) {
      getSocket().emit("viewport:zindex", { id, zIndex: viewport.zIndex });
    }
  },

  syncChangeUrl: (url) => {
    useUrlStore.getState().setUrl(url);
    getSocket().emit("url:change", { url });
  },
}));
