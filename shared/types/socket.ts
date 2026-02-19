import { CanvasViewport } from "./canvas";
import { RoomUser, RoomInfo } from "./room";

// 클라이언트 → 서버
export interface ClientToServerEvents {
  "room:list": (callback: (rooms: RoomInfo[]) => void) => void;
  "room:create": (
    data: { name: string },
    callback: (result: { roomId: string }) => void,
  ) => void;
  "room:join": (
    data: { roomId: string },
    callback: (result: RoomJoinResult) => void,
  ) => void;
  "url:change": (data: { url: string }) => void;
  "viewport:add": (
    data: { viewport: CanvasViewport },
    callback?: (result: { success: boolean }) => void,
  ) => void;
  "viewport:move": (data: { id: string; x: number; y: number }) => void;
  "viewport:resize": (data: {
    id: string;
    width: number;
    height: number;
  }) => void;
  "viewport:remove": (data: { id: string }) => void;
  "viewport:zindex": (data: { id: string; zIndex: number }) => void;
  "cursor:move": (data: { x: number; y: number }) => void;
}

// 서버 → 클라이언트
export interface ServerToClientEvents {
  "room:created": (data: RoomInfo) => void;
  "room:updated": (data: RoomInfo) => void;
  "room:deleted": (data: { roomId: string }) => void;
  "user:joined": (user: RoomUser) => void;
  "user:left": (data: { userId: string }) => void;
  "viewport:added": (data: { viewport: CanvasViewport }) => void;
  "viewport:moved": (data: { id: string; x: number; y: number }) => void;
  "viewport:resized": (data: {
    id: string;
    width: number;
    height: number;
  }) => void;
  "viewport:removed": (data: { id: string }) => void;
  "viewport:zindexed": (data: { id: string; zIndex: number }) => void;
  "url:changed": (data: { url: string }) => void;
  "cursor:moved": (data: { userId: string; x: number; y: number }) => void;
}

// room:join 콜백 결과 타입
export interface RoomJoinResult {
  error?: string;
  user: RoomUser;
  state: {
    url: string;
    viewports: CanvasViewport[];
    users: RoomUser[];
  };
}
