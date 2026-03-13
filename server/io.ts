import { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@shared/types";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

let io: TypedServer | null = null;

export function setIO(server: TypedServer) {
  io = server;
}

export function getIO(): TypedServer {
  if (!io) {
    throw new Error("Socket.IO server not initialized");
  }
  return io;
}
