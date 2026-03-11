import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomUser,
  CanvasViewport,
} from "@shared/types";
import {
  loadRoomFromDB,
  saveRoomUrl,
  saveRoomViewports,
} from "./room-persistence";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface ActiveRoomState {
  url: string;
  viewports: CanvasViewport[];
  users: Map<string, RoomUser>;
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

// 접속 중인 룸의 활성 상태 (ephemeral)
const activeRooms = new Map<string, ActiveRoomState>();

export function setupSocketHandlers(io: TypedServer) {
  io.on("connection", (socket: TypedSocket) => {
    let currentRoomId: string | null = null;

    // 방 입장 — DB에서 로드
    socket.on("room:join", async ({ roomId }, callback) => {
      try {
        let active = activeRooms.get(roomId);

        if (!active) {
          // DB에서 룸 로드
          const dbRoom = await loadRoomFromDB(roomId);

          if (!dbRoom) {
            return callback({ error: "Room not found" });
          }

          active = {
            url: dbRoom.url,
            viewports: dbRoom.viewports,
            users: new Map(),
          };
          activeRooms.set(roomId, active);
        }

        const socketData = socket.data as {
          user?: { name?: string; image?: string };
        };
        const userName =
          socketData?.user?.name || `User-${socket.id.slice(0, 4)}`;

        const user: RoomUser = {
          id: socket.id,
          name: userName,
          color: COLORS[active.users.size % COLORS.length],
        };

        active.users.set(socket.id, user);

        socket.join(roomId);
        currentRoomId = roomId;

        callback({
          user,
          state: {
            url: active.url,
            viewports: active.viewports,
            users: Array.from(active.users.values()),
          },
        });

        socket.to(roomId).emit("user:joined", user);
      } catch {
        callback({ error: "Failed to join room" });
      }
    });

    // URL 변경
    socket.on("url:change", ({ url }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);

      if (active) {
        active.url = url;
        saveRoomUrl(currentRoomId, url);
      }

      socket.to(currentRoomId).emit("url:changed", { url });
    });

    // 뷰포트 추가
    socket.on("viewport:add", ({ viewport }, callback) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);

      if (!active) {
        return;
      }

      active.viewports.push(viewport);
      saveRoomViewports(currentRoomId, active.viewports);

      socket.to(currentRoomId).emit("viewport:added", { viewport });

      if (callback) {
        callback({ success: true });
      }
    });

    // 뷰포트 이동
    socket.on("viewport:move", ({ id, x, y }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.x = x;
        vp.y = y;
        saveRoomViewports(currentRoomId, active!.viewports);
      }

      socket.to(currentRoomId).emit("viewport:moved", { id, x, y });
    });

    // 뷰포트 리사이즈
    socket.on("viewport:resize", ({ id, width, height }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.width = width;
        vp.height = height;
        saveRoomViewports(currentRoomId, active!.viewports);
      }

      socket.to(currentRoomId).emit("viewport:resized", { id, width, height });
    });

    // 뷰포트 삭제
    socket.on("viewport:remove", ({ id }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);
      if (active) {
        active.viewports = active.viewports.filter((v) => v.id !== id);
        saveRoomViewports(currentRoomId, active.viewports);
      }

      socket.to(currentRoomId).emit("viewport:removed", { id });
    });

    // 뷰포트 Z-index 변경
    socket.on("viewport:zindex", ({ id, zIndex }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.zIndex = zIndex;
        saveRoomViewports(currentRoomId, active!.viewports);
      }

      socket.to(currentRoomId).emit("viewport:zindexed", { id, zIndex });
    });

    // 커서 이동
    socket.on("cursor:move", ({ x, y }) => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);
      const user = active?.users.get(socket.id);

      if (user) {
        active?.users.set(socket.id, { ...user, cursor: { x, y } });
      }

      socket.to(currentRoomId).emit("cursor:moved", {
        userId: socket.id,
        x,
        y,
      });
    });

    // 연결 해제
    socket.on("disconnect", () => {
      if (!currentRoomId) {
        return;
      }

      const active = activeRooms.get(currentRoomId);

      if (!active) {
        return;
      }

      active.users.delete(socket.id);

      socket.to(currentRoomId).emit("user:left", { userId: socket.id });

      // 마지막 유저가 떠나면 인메모리 활성 상태만 정리 (DB 룸은 유지)
      if (active.users.size === 0) {
        activeRooms.delete(currentRoomId);
      }
    });
  });
}
