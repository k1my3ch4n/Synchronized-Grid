import {
  WorkspaceUser,
  type WorkspaceRole,
  CanvasViewport,
} from "@shared/types";
import { getSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas/model/store";
import { useUrlStore } from "@features/url-input/model/store";
import type { WorkspaceStoreState } from "./store";

const SOCKET_EVENTS = [
  "user:joined",
  "user:left",
  "viewport:added",
  "viewport:moved",
  "viewport:resized",
  "viewport:removed",
  "viewport:zindexed",
  "url:changed",
  "cursor:moved",
  "workspace:renamed",
  "member:role-changed",
] as const;

export function setupSocketListeners(
  socket: ReturnType<typeof getSocket>,
  set: (
    fn: (state: WorkspaceStoreState) => Partial<WorkspaceStoreState>,
  ) => void,
) {
  // 기존 리스너 제거 (중복 등록 방지)
  SOCKET_EVENTS.forEach((event) => socket.off(event));

  // 유저 입장 (중복 방지)
  socket.on("user:joined", (user: WorkspaceUser) => {
    set((state: WorkspaceStoreState) => ({
      users: state.users.some((u) => u.id === user.id)
        ? state.users
        : [...state.users, user],
    }));
  });

  // 유저 퇴장
  socket.on("user:left", ({ userId }: { userId: string }) => {
    set((state: WorkspaceStoreState) => ({
      users: state.users.filter((u) => u.id !== userId),
    }));
  });

  // 뷰포트 추가 (서버에서 받은 viewport는 이미 id 포함)
  socket.on("viewport:added", ({ viewport }: { viewport: CanvasViewport }) => {
    const viewports = useCanvasStore.getState().viewport;
    useCanvasStore.setState({ viewport: [...viewports, viewport] });
  });

  // 뷰포트 이동
  socket.on("viewport:moved", ({ id, x, y }) => {
    useCanvasStore.getState().updatePosition(id, x, y);
  });

  // 뷰포트 리사이즈
  socket.on("viewport:resized", ({ id, width, height }) => {
    useCanvasStore.getState().updateSize(id, width, height);
  });

  // 뷰포트 삭제
  socket.on("viewport:removed", ({ id }: { id: string }) => {
    useCanvasStore.getState().removeViewport(id);
  });

  // 뷰포트 Z-index 변경
  socket.on(
    "viewport:zindexed",
    ({ id, zIndex }: { id: string; zIndex: number }) => {
      useCanvasStore.setState((state) => ({
        viewport: state.viewport.map((v) =>
          v.id === id ? { ...v, zIndex } : v,
        ),
      }));
    },
  );

  // URL 변경
  socket.on("url:changed", ({ url }: { url: string }) => {
    useUrlStore.getState().setUrl(url);
  });

  // 워크스페이스 이름 변경
  socket.on("workspace:renamed", ({ name }: { name: string }) => {
    set(() => ({ workspaceName: name }));
  });

  // 멤버 역할 변경
  socket.on(
    "member:role-changed",
    ({ userId, newRole }: { userId: string; newRole: WorkspaceRole }) => {
      set((state: WorkspaceStoreState) => ({
        users: state.users.map((u) =>
          u.userId === userId ? { ...u, role: newRole } : u,
        ),
        currentUser:
          state.currentUser?.userId === userId
            ? { ...state.currentUser, role: newRole }
            : state.currentUser,
      }));
    },
  );

  // 커서 이동
  socket.on("cursor:moved", ({ userId, x, y }) => {
    set((state: WorkspaceStoreState) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, cursor: { x, y } } : u,
      ),
    }));
  });
}
