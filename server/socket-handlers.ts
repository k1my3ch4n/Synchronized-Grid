import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomUser,
  CanvasViewport,
} from "@shared/types";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface RoomState {
  id: string;
  name: string;
  url: string;
  viewports: CanvasViewport[];
  users: Map<string, RoomUser>;
  createdAt: Date;
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

const ADJECTIVES = ["빠른", "용감한", "현명한", "밝은", "조용한", "강한"];
const ANIMALS = ["사자", "독수리", "돌고래", "판다", "여우", "늑대"];

function generateUserName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj} ${animal}`;
}

const rooms = new Map<string, RoomState>();

export function setupSocketHandlers(io: TypedServer) {
  io.on("connection", (socket: TypedSocket) => {
    let currentRoomId: string | null = null;

    // 방 목록 조회
    socket.on("room:list", (callback) => {
      const roomList = Array.from(rooms.values()).map((room) => ({
        id: room.id,
        name: room.name,
        userCount: room.users.size,
        createdAt: room.createdAt,
      }));

      callback(roomList);
    });

    // 방 생성
    socket.on("room:create", ({ name }, callback) => {
      const roomId = crypto.randomUUID();

      rooms.set(roomId, {
        id: roomId,
        name,
        url: "",
        viewports: [],
        users: new Map(),
        createdAt: new Date(),
      });

      callback({ roomId });

      io.emit("room:created", { id: roomId, name, userCount: 0 });
    });

    // 방 입장
    socket.on("room:join", ({ roomId }, callback) => {
      const room = rooms.get(roomId);

      if (!room) {
        return callback({ error: "Room not found" });
      }

      const user: RoomUser = {
        id: socket.id,
        name: generateUserName(),
        color: COLORS[room.users.size % COLORS.length],
      };

      room.users.set(socket.id, user);

      socket.join(roomId);

      currentRoomId = roomId;

      callback({
        user,
        state: {
          url: room.url,
          viewports: room.viewports,
          users: Array.from(room.users.values()),
        },
      });

      socket.to(roomId).emit("user:joined", user);

      io.emit("room:updated", {
        id: roomId,
        name: room.name,
        userCount: room.users.size,
      });
    });

    // URL 변경
    socket.on("url:change", ({ url }) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);

      if (room) {
        room.url = url;
      }

      socket.to(currentRoomId).emit("url:changed", { url });
    });

    // 뷰포트 추가
    socket.on("viewport:add", ({ viewport }, callback) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);

      if (!room) {
        return;
      }

      room.viewports.push(viewport);

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

      const room = rooms.get(currentRoomId);

      const vp = room?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.x = x;
        vp.y = y;
      }

      socket.to(currentRoomId).emit("viewport:moved", { id, x, y });
    });

    // 뷰포트 리사이즈
    socket.on("viewport:resize", ({ id, width, height }) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);

      const vp = room?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.width = width;
        vp.height = height;
      }

      socket.to(currentRoomId).emit("viewport:resized", { id, width, height });
    });

    // 뷰포트 삭제
    socket.on("viewport:remove", ({ id }) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);

      if (room) {
        room.viewports = room.viewports.filter((v) => v.id !== id);
      }

      socket.to(currentRoomId).emit("viewport:removed", { id });
    });

    // 뷰포트 Z-index 변경
    socket.on("viewport:zindex", ({ id, zIndex }) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);

      const vp = room?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.zIndex = zIndex;
      }

      socket.to(currentRoomId).emit("viewport:zindexed", { id, zIndex });
    });

    // 커서 이동
    socket.on("cursor:move", ({ x, y }) => {
      if (!currentRoomId) {
        return;
      }

      const room = rooms.get(currentRoomId);
      const user = room?.users.get(socket.id);

      if (user) {
        user.cursor = { x, y };
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

      const room = rooms.get(currentRoomId);

      if (!room) {
        return;
      }

      room.users.delete(socket.id);

      socket.to(currentRoomId).emit("user:left", { userId: socket.id });

      if (room.users.size === 0) {
        const roomIdToDelete = currentRoomId;

        // 임시 5초 후 방 삭제 (클라이언트가 빠르게 재접속하는 경우를 위해)
        setTimeout(() => {
          const room = rooms.get(roomIdToDelete);

          if (room && room.users.size === 0) {
            rooms.delete(roomIdToDelete);
            io.emit("room:deleted", { roomId: roomIdToDelete });
          }
        }, 5000);
      } else {
        io.emit("room:updated", {
          id: currentRoomId,
          name: room.name,
          userCount: room.users.size,
        });
      }
    });
  });
}
