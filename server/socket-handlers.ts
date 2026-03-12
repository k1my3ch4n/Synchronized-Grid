import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  WorkspaceUser,
  CanvasViewport,
} from "@shared/types";
import {
  loadWorkspaceFromDB,
  saveWorkspaceUrl,
  saveWorkspaceViewports,
  flushPendingSave,
} from "./workspace-persistence";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface ActiveWorkspaceState {
  url: string;
  viewports: CanvasViewport[];
  users: Map<string, WorkspaceUser>;
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];

// 접속 중인 워크스페이스의 활성 상태 (ephemeral)
const activeWorkspaces = new Map<string, ActiveWorkspaceState>();

export function setupSocketHandlers(io: TypedServer) {
  io.on("connection", (socket: TypedSocket) => {
    let currentWorkspaceId: string | null = null;

    // 워크스페이스 입장 — DB에서 로드
    socket.on("workspace:join", async ({ workspaceId }, callback) => {
      try {
        let active = activeWorkspaces.get(workspaceId);

        if (!active) {
          const dbWorkspace = await loadWorkspaceFromDB(workspaceId);

          if (!dbWorkspace) {
            return callback({ error: "Workspace not found" });
          }

          active = {
            url: dbWorkspace.url,
            viewports: dbWorkspace.viewports,
            users: new Map(),
          };
          activeWorkspaces.set(workspaceId, active);
        }

        const socketData = socket.data as {
          user?: { name?: string; image?: string };
        };
        const userName =
          socketData?.user?.name || `User-${socket.id.slice(0, 4)}`;

        const user: WorkspaceUser = {
          id: socket.id,
          name: userName,
          color: COLORS[active.users.size % COLORS.length],
        };

        active.users.set(socket.id, user);

        socket.join(workspaceId);
        currentWorkspaceId = workspaceId;

        callback({
          user,
          state: {
            url: active.url,
            viewports: active.viewports,
            users: Array.from(active.users.values()),
          },
        });

        socket.to(workspaceId).emit("user:joined", user);
      } catch {
        callback({ error: "Failed to join workspace" });
      }
    });

    // URL 변경
    socket.on("url:change", ({ url }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);

      if (active) {
        active.url = url;
        saveWorkspaceUrl(currentWorkspaceId, url);
      }

      socket.to(currentWorkspaceId).emit("url:changed", { url });
    });

    // 뷰포트 추가
    socket.on("viewport:add", ({ viewport }, callback) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);

      if (!active) {
        return;
      }

      active.viewports.push(viewport);
      saveWorkspaceViewports(currentWorkspaceId, active.viewports);

      socket.to(currentWorkspaceId).emit("viewport:added", { viewport });

      if (callback) {
        callback({ success: true });
      }
    });

    // 뷰포트 이동
    socket.on("viewport:move", ({ id, x, y }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.x = x;
        vp.y = y;
        saveWorkspaceViewports(currentWorkspaceId, active!.viewports);
      }

      socket.to(currentWorkspaceId).emit("viewport:moved", { id, x, y });
    });

    // 뷰포트 리사이즈
    socket.on("viewport:resize", ({ id, width, height }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.width = width;
        vp.height = height;
        saveWorkspaceViewports(currentWorkspaceId, active!.viewports);
      }

      socket
        .to(currentWorkspaceId)
        .emit("viewport:resized", { id, width, height });
    });

    // 뷰포트 삭제
    socket.on("viewport:remove", ({ id }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      if (active) {
        active.viewports = active.viewports.filter((v) => v.id !== id);
        saveWorkspaceViewports(currentWorkspaceId, active.viewports);
      }

      socket.to(currentWorkspaceId).emit("viewport:removed", { id });
    });

    // 뷰포트 Z-index 변경
    socket.on("viewport:zindex", ({ id, zIndex }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.zIndex = zIndex;
        saveWorkspaceViewports(currentWorkspaceId, active!.viewports);
      }

      socket.to(currentWorkspaceId).emit("viewport:zindexed", { id, zIndex });
    });

    // 커서 이동
    socket.on("cursor:move", ({ x, y }) => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      const user = active?.users.get(socket.id);

      if (user) {
        active?.users.set(socket.id, { ...user, cursor: { x, y } });
      }

      socket.to(currentWorkspaceId).emit("cursor:moved", {
        userId: socket.id,
        x,
        y,
      });
    });

    // 연결 해제
    socket.on("disconnect", async () => {
      if (!currentWorkspaceId) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);

      if (!active) {
        return;
      }

      active.users.delete(socket.id);

      socket.to(currentWorkspaceId).emit("user:left", { userId: socket.id });

      // 마지막 유저가 떠나면 대기 중인 저장을 flush 후 인메모리 상태 정리
      if (active.users.size === 0) {
        await flushPendingSave(currentWorkspaceId);
        activeWorkspaces.delete(currentWorkspaceId);
      }
    });
  });
}
