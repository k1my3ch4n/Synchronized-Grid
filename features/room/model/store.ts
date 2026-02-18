import { create } from "zustand";
import { RoomUser, CanvasViewport } from "@shared/types";
import { connectSocket, getSocket, disconnectSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas/model/store";
import { useUrlStore } from "@features/url-input/model/store";

interface RoomStoreState {
  roomId: string | null;
  isConnected: boolean;
  currentUser: RoomUser | null;
  users: RoomUser[];

  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;

  syncAddViewport: (viewport: Omit<CanvasViewport, "id" | "zIndex">) => void;
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

      // 소켓 리스너 등록
      setupSocketListeners(socket, set);
    });
  },

  leaveRoom: () => {
    disconnectSocket();
    set({ roomId: null, isConnected: false, currentUser: null, users: [] });
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

  syncChangeUrl: (url) => {
    useUrlStore.getState().setUrl(url);
    getSocket().emit("url:change", { url });
  },
}));

const SOCKET_EVENTS = [
  "user:joined",
  "user:left",
  "viewport:added",
  "viewport:moved",
  "viewport:resized",
  "viewport:removed",
  "url:changed",
  "cursor:moved",
];

function setupSocketListeners(socket: any, set: any) {
  // 기존 리스너 제거 (중복 등록 방지)
  SOCKET_EVENTS.forEach((event) => socket.off(event));

  // 유저 입장
  socket.on("user:joined", (user: RoomUser) => {
    set((state: RoomStoreState) => ({ users: [...state.users, user] }));
  });

  // 유저 퇴장
  socket.on("user:left", ({ userId }: { userId: string }) => {
    set((state: RoomStoreState) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  });

  // 뷰포트 추가 (서버에서 받은 viewport는 이미 id 포함)
  socket.on("viewport:added", ({ viewport }: { viewport: CanvasViewport }) => {
    const viewports = useCanvasStore.getState().viewport;
    useCanvasStore.setState({ viewport: [...viewports, viewport] });
  });

  // 뷰포트 이동
  socket.on("viewport:moved", ({ id, x, y }: any) => {
    useCanvasStore.getState().updatePosition(id, x, y);
  });

  // 뷰포트 리사이즈
  socket.on("viewport:resized", ({ id, width, height }: any) => {
    useCanvasStore.getState().updateSize(id, width, height);
  });

  // 뷰포트 삭제
  socket.on("viewport:removed", ({ id }: { id: string }) => {
    useCanvasStore.getState().removeViewport(id);
  });

  // URL 변경
  socket.on("url:changed", ({ url }: { url: string }) => {
    useUrlStore.getState().setUrl(url);
  });

  // 커서 이동
  socket.on("cursor:moved", ({ userId, x, y }: any) => {
    set((state: RoomStoreState) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, cursor: { x, y } } : u,
      ),
    }));
  });
}
