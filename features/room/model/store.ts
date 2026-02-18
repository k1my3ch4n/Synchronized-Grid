import { create } from "zustand";
import { RoomUser, CanvasViewport } from "@shared/types";

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

  joinRoom: () => {},
  leaveRoom: () => {},

  syncAddViewport: () => {},
  syncUpdatePosition: () => {},
  syncUpdateSize: () => {},
  syncRemoveViewport: () => {},
  syncChangeUrl: () => {},
}));
