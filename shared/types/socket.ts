import { CanvasViewport } from "./canvas";
import { WorkspaceUser, WorkspaceRole } from "./workspace";

// 클라이언트 → 서버
export interface ClientToServerEvents {
  "workspace:join": (
    data: { workspaceId: string },
    callback: (result: WorkspaceJoinResult) => void,
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
  "workspace:rename": (data: { name: string }) => void;
  "member:role-change": (data: {
    userId: string;
    newRole: WorkspaceRole;
  }) => void;
  "member:kick": (data: { userId: string }) => void;
  "workspace:delete": () => void;
}

// 서버 → 클라이언트
export interface ServerToClientEvents {
  "user:joined": (user: WorkspaceUser) => void;
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
  "workspace:renamed": (data: { name: string }) => void;
  "member:role-changed": (data: {
    userId: string;
    newRole: WorkspaceRole;
  }) => void;
  "member:kicked": (data: { reason: string }) => void;
  "workspace:deleted": () => void;
}

// workspace:join 콜백 결과 타입
export type WorkspaceJoinResult =
  | { error: string }
  | {
      user: WorkspaceUser;
      state: {
        name: string;
        url: string;
        viewports: CanvasViewport[];
        users: WorkspaceUser[];
      };
    };
