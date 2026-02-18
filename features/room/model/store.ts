import { create } from "zustand";
import { RoomUser, CanvasViewport } from "@shared/types";
import { connectSocket, disconnectSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas/model/store";
import { useUrlStore } from "@features/url-input/model/store";

interface RoomStoreState {
  roomId: string | null;
  isConnected: boolean;
  currentUser: RoomUser | null;
  users: RoomUser[];

  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;

  syncAddViewport: (viewport: CanvasViewport) => void;
  syncUpdatePosition: (id: string, x: number, y: number) => void;
  syncUpdateSize: (id: string, width: number, height: number) => void;
  syncRemoveViewport: (id: string) => void;
  syncChangeUrl: (url: string) => void;
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  roomId: null,
  isConnected: false,
  currentUser: null,
  users: [],

  joinRoom: (roomId) => {
    const socket = connectSocket();

    socket.emit("room:join", { roomId }, (result: any) => {
      if (result.error) {
        return;
      }

      set({
        roomId,
        isConnected: true,
        currentUser: result.user,
        users: result.state.users,
      });

      // 서버 상태로 Canvas Store 초기화
      useCanvasStore.setState({ viewport: result.state.viewports });

      if (result.state.url) {
        useUrlStore.getState().setUrl(result.state.url);
      }
    });
  },

  leaveRoom: () => {
    disconnectSocket();
    set({ roomId: null, isConnected: false, currentUser: null, users: [] });
  },

  syncAddViewport: () => {},
  syncUpdatePosition: () => {},
  syncUpdateSize: () => {},
  syncRemoveViewport: () => {},
  syncChangeUrl: () => {},
}));
