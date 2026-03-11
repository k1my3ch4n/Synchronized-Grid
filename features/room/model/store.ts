import { create } from "zustand";
import { RoomUser, CanvasViewport, RoomJoinResult } from "@shared/types";
import { connectSocket, getSocket, disconnectSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas/model/store";
import { useUrlStore } from "@features/url-input/model/store";
import { setupSocketListeners } from "./socket-listeners";

export interface RoomStoreState {
  roomId: string | null;
  workspaceId: string | null;
  isConnected: boolean;
  currentUser: RoomUser | null;
  users: RoomUser[];
  error: string | null;

  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;

  syncAddViewport: (viewport: Omit<CanvasViewport, "id" | "zIndex">) => void;
  syncUpdatePosition: (id: string, x: number, y: number) => void;
  syncUpdateSize: (id: string, width: number, height: number) => void;
  syncRemoveViewport: (id: string) => void;
  syncUpdateZIndex: (id: string) => void;
  syncChangeUrl: (url: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  roomId: null,
  workspaceId: null,
  isConnected: false,
  currentUser: null,
  users: [],
  error: null,

  joinRoom: (roomId) => {
    set({ error: null });
    const socket = connectSocket();

    socket.emit("room:join", { roomId }, (result: RoomJoinResult) => {
      if ("error" in result) {
        set({ error: result.error });
        return;
      }

      set({
        roomId,
        workspaceId: result.workspaceId,
        isConnected: true,
        currentUser: result.user,
        users: result.state.users,
      });

      // 서버 상태로 Canvas Store 초기화
      useCanvasStore.setState({ viewport: result.state.viewports });

      if (result.state.url) {
        useUrlStore.getState().setUrl(result.state.url);
      }

      // 소켓 리스너 등록
      setupSocketListeners(socket, set);
    });
  },

  leaveRoom: () => {
    disconnectSocket();
    set({
      roomId: null,
      workspaceId: null,
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
