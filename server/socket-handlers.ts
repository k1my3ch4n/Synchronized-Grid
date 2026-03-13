import { Server, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  WorkspaceUser,
  WorkspaceRole,
  CanvasViewport,
} from "@shared/types";
import {
  loadWorkspaceFromDB,
  saveWorkspaceUrl,
  saveWorkspaceViewports,
  flushPendingSave,
} from "./workspace-persistence";
import { prisma } from "@/lib/prisma";
import type { SocketUser } from "./socket-auth";
import {
  EDIT_ROLES,
  ALL_ROLES,
  USER_COLORS,
  WORKSPACE_ROLES,
  WORKSPACE_NAME_MAX_LENGTH,
  URL_MAX_LENGTH,
  VIEWPORT_MIN_SIZE,
  VIEWPORT_MAX_SIZE,
  VIEWPORT_MAX_POSITION,
  VIEWPORT_MAX_ZINDEX,
  VIEWPORT_LABEL_MAX_LENGTH,
} from "@shared/constants";
import {
  isValidString,
  isValidNumber,
  isInRange,
  createRateLimiter,
} from "./validation";
import { logger } from "./logger";

// Rate limiters: 고빈도 이벤트(커서/뷰포트 이동)와 일반 이벤트 분리
const cursorLimiter = createRateLimiter(1000, 30); // 1초에 30회
const eventLimiter = createRateLimiter(1000, 10); // 1초에 10회

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

interface ActiveWorkspaceState {
  name: string;
  url: string;
  viewports: CanvasViewport[];
  users: Map<string, WorkspaceUser>;
}

// 접속 중인 워크스페이스의 활성 상태 (ephemeral)
const activeWorkspaces = new Map<string, ActiveWorkspaceState>();

/**
 * API 라우트에서 워크스페이스 삭제 시 호출
 * 접속 중인 모든 소켓에 workspace:deleted 알림 후 정리
 */
export async function notifyWorkspaceDeleted(
  io: TypedServer,
  workspaceId: string,
) {
  const active = activeWorkspaces.get(workspaceId);
  if (!active) {
    return;
  }

  io.to(workspaceId).emit("workspace:deleted");

  const sockets = await io.in(workspaceId).fetchSockets();
  for (const s of sockets) {
    s.leave(workspaceId);
  }

  await flushPendingSave(workspaceId);
  activeWorkspaces.delete(workspaceId);
}

export function setupSocketHandlers(io: TypedServer) {
  io.on("connection", (socket: TypedSocket) => {
    let currentWorkspaceId: string | null = null;

    // 워크스페이스 입장 — DB에서 로드
    socket.on("workspace:join", async ({ workspaceId }, callback) => {
      try {
        if (!isValidString(workspaceId)) {
          return callback({ error: "Invalid workspace ID" });
        }

        let active = activeWorkspaces.get(workspaceId);

        if (!active) {
          // 이전 소켓의 disconnect에서 flush가 아직 진행 중일 수 있으므로 대기
          await flushPendingSave(workspaceId);

          const dbWorkspace = await loadWorkspaceFromDB(workspaceId);

          if (!dbWorkspace) {
            return callback({ error: "Workspace not found" });
          }

          active = {
            name: dbWorkspace.name,
            url: dbWorkspace.url,
            viewports: dbWorkspace.viewports,
            users: new Map(),
          };
          activeWorkspaces.set(workspaceId, active);
        }

        const socketUser = (socket.data as { user?: SocketUser }).user;
        const userName = socketUser?.name || `User-${socket.id.slice(0, 4)}`;

        // DB에서 멤버 역할 조회
        let role: WorkspaceRole = WORKSPACE_ROLES.VIEWER;
        if (socketUser?.id) {
          const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { ownerId: true },
          });

          if (workspace?.ownerId === socketUser.id) {
            role = WORKSPACE_ROLES.OWNER;
          } else {
            const member = await prisma.workspaceMember.findUnique({
              where: {
                workspaceId_userId: {
                  workspaceId,
                  userId: socketUser.id,
                },
              },
            });

            if (member) {
              role = member.role as WorkspaceRole;
            }
          }
        }

        const user: WorkspaceUser = {
          id: socket.id,
          userId: socketUser?.id ?? "",
          name: userName,
          color: USER_COLORS[active.users.size % USER_COLORS.length],
          role,
        };

        active.users.set(socket.id, user);

        socket.join(workspaceId);
        currentWorkspaceId = workspaceId;

        callback({
          user,
          state: {
            name: active.name,
            url: active.url,
            viewports: active.viewports,
            users: Array.from(active.users.values()),
          },
        });

        socket.to(workspaceId).emit("user:joined", user);
      } catch (err) {
        logger.error(
          "socket-handlers",
          `workspace:join failed for ${workspaceId}`,
          err,
        );
        callback({ error: "Failed to join workspace" });
      }
    });

    // 현재 워크스페이스의 활성 상태와 요청 유저를 반환
    const getActiveAndUser = () => {
      if (!currentWorkspaceId) {
        return null;
      }

      const active = activeWorkspaces.get(currentWorkspaceId);
      const user = active?.users.get(socket.id);

      if (!active || !user) {
        return null;
      }

      return { active, user, workspaceId: currentWorkspaceId };
    };

    // 현재 유저가 편집 권한이 있는지 확인
    const canEdit = () => {
      const ctx = getActiveAndUser();
      return ctx ? EDIT_ROLES.includes(ctx.user.role) : false;
    };

    // 현재 유저가 소유자인지 확인
    const requireOwner = () => {
      const ctx = getActiveAndUser();

      if (!ctx || ctx.user.role !== WORKSPACE_ROLES.OWNER) {
        return null;
      }

      return ctx;
    };

    // userId로 접속 중인 유저의 [socketId, user] 엔트리 검색
    const findUserByUserId = (active: ActiveWorkspaceState, userId: string) =>
      [...active.users.entries()].find(([, u]) => u.userId === userId) ?? null;

    // URL 변경
    socket.on("url:change", async ({ url }) => {
      if (!canEdit() || !eventLimiter(socket.id)) {
        return;
      }

      if (typeof url !== "string" || url.length > URL_MAX_LENGTH) {
        return;
      }

      // 위험한 프로토콜 차단 (javascript:, data: 등)
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          logger.warn("socket-handlers", "Blocked invalid URL protocol", {
            socketId: socket.id,
            protocol: parsed.protocol,
          });
          return;
        }
      } catch {
        logger.warn("socket-handlers", "Blocked malformed URL", {
          socketId: socket.id,
        });
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);

      if (active) {
        active.url = url;
        await saveWorkspaceUrl(currentWorkspaceId!, url);
      }

      socket.to(currentWorkspaceId!).emit("url:changed", { url });
    });

    // 뷰포트 추가
    socket.on("viewport:add", ({ viewport }, callback) => {
      if (!canEdit() || !eventLimiter(socket.id)) {
        return;
      }

      if (
        !isValidNumber(viewport.width) ||
        !isValidNumber(viewport.height) ||
        !isInRange(viewport.width, VIEWPORT_MIN_SIZE, VIEWPORT_MAX_SIZE) ||
        !isInRange(viewport.height, VIEWPORT_MIN_SIZE, VIEWPORT_MAX_SIZE) ||
        (viewport.label !== undefined &&
          (typeof viewport.label !== "string" ||
            viewport.label.length > VIEWPORT_LABEL_MAX_LENGTH))
      ) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);

      if (!active) {
        return;
      }

      active.viewports.push(viewport);
      saveWorkspaceViewports(currentWorkspaceId!, active.viewports);

      socket.to(currentWorkspaceId!).emit("viewport:added", { viewport });

      if (callback) {
        callback({ success: true });
      }
    });

    // 뷰포트 이동
    socket.on("viewport:move", ({ id, x, y }) => {
      if (!canEdit() || !cursorLimiter(socket.id)) {
        return;
      }

      if (!isValidString(id)) {
        return;
      }

      if (
        !isValidNumber(x) ||
        !isValidNumber(y) ||
        !isInRange(x, -VIEWPORT_MAX_POSITION, VIEWPORT_MAX_POSITION) ||
        !isInRange(y, -VIEWPORT_MAX_POSITION, VIEWPORT_MAX_POSITION)
      ) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.x = x;
        vp.y = y;
        saveWorkspaceViewports(currentWorkspaceId!, active!.viewports);
      }

      socket.to(currentWorkspaceId!).emit("viewport:moved", { id, x, y });
    });

    // 뷰포트 리사이즈
    socket.on("viewport:resize", ({ id, width, height }) => {
      if (!canEdit() || !cursorLimiter(socket.id)) {
        return;
      }

      if (!isValidString(id)) {
        return;
      }

      if (
        !isValidNumber(width) ||
        !isValidNumber(height) ||
        !isInRange(width, VIEWPORT_MIN_SIZE, VIEWPORT_MAX_SIZE) ||
        !isInRange(height, VIEWPORT_MIN_SIZE, VIEWPORT_MAX_SIZE)
      ) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.width = width;
        vp.height = height;
        saveWorkspaceViewports(currentWorkspaceId!, active!.viewports);
      }

      socket
        .to(currentWorkspaceId!)
        .emit("viewport:resized", { id, width, height });
    });

    // 뷰포트 삭제
    socket.on("viewport:remove", ({ id }) => {
      if (!canEdit() || !eventLimiter(socket.id)) {
        return;
      }

      if (!isValidString(id)) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);
      if (active) {
        active.viewports = active.viewports.filter((v) => v.id !== id);
        saveWorkspaceViewports(currentWorkspaceId!, active.viewports);
      }

      socket.to(currentWorkspaceId!).emit("viewport:removed", { id });
    });

    // 뷰포트 Z-index 변경
    socket.on("viewport:zindex", ({ id, zIndex }) => {
      if (!canEdit() || !cursorLimiter(socket.id)) {
        return;
      }

      if (!isValidString(id)) {
        return;
      }

      if (
        !isValidNumber(zIndex) ||
        !isInRange(zIndex, 0, VIEWPORT_MAX_ZINDEX)
      ) {
        return;
      }

      const active = activeWorkspaces.get(currentWorkspaceId!);
      const vp = active?.viewports.find((v) => v.id === id);

      if (vp) {
        vp.zIndex = zIndex;
        saveWorkspaceViewports(currentWorkspaceId!, active!.viewports);
      }

      socket.to(currentWorkspaceId!).emit("viewport:zindexed", { id, zIndex });
    });

    // 워크스페이스 이름 변경
    socket.on("workspace:rename", async ({ name }) => {
      const ctx = requireOwner();
      if (!ctx) {
        return;
      }

      if (typeof name !== "string") {
        return;
      }

      const trimmed = name.trim();

      if (!trimmed || trimmed.length > WORKSPACE_NAME_MAX_LENGTH) {
        return;
      }

      try {
        await prisma.workspace.update({
          where: { id: ctx.workspaceId },
          data: { name: trimmed },
        });

        ctx.active.name = trimmed;
        socket.to(ctx.workspaceId).emit("workspace:renamed", { name: trimmed });
      } catch (err) {
        logger.error(
          "socket-handlers",
          "workspace:rename DB update failed",
          err,
        );
      }
    });

    // 멤버 역할 변경
    socket.on("member:role-change", async ({ userId, newRole }) => {
      if (!isValidString(userId)) {
        return;
      }
      if (!ALL_ROLES.includes(newRole)) {
        return;
      }

      const ctx = requireOwner();
      if (!ctx) {
        return;
      }

      const targetEntry = findUserByUserId(ctx.active, userId);
      if (!targetEntry) {
        return;
      }

      const [targetSocketId, targetUser] = targetEntry;

      try {
        if (newRole === WORKSPACE_ROLES.OWNER) {
          // 소유권 이전: 대상 → OWNER, 요청자 → EDITOR
          ctx.active.users.set(targetSocketId, {
            ...targetUser,
            role: WORKSPACE_ROLES.OWNER,
          });
          ctx.active.users.set(socket.id, {
            ...ctx.user,
            role: WORKSPACE_ROLES.EDITOR,
          });

          io.to(ctx.workspaceId).emit("member:role-changed", {
            userId,
            newRole: WORKSPACE_ROLES.OWNER,
          });
          io.to(ctx.workspaceId).emit("member:role-changed", {
            userId: ctx.user.userId,
            newRole: WORKSPACE_ROLES.EDITOR,
          });
        } else {
          ctx.active.users.set(targetSocketId, { ...targetUser, role: newRole });

          io.to(ctx.workspaceId).emit("member:role-changed", {
            userId,
            newRole,
          });
        }
      } catch (err) {
        logger.error(
          "socket-handlers",
          "member:role-change failed",
          err,
        );
      }

      logger.info("socket-handlers", "member:role-change", {
        workspaceId: ctx.workspaceId,
        changedBy: ctx.user.userId,
        targetUserId: userId,
        newRole,
      });
    });

    // 멤버 추방 (소켓 강제 퇴장)
    socket.on("member:kick", ({ userId }) => {
      if (!isValidString(userId)) {
        return;
      }

      const ctx = requireOwner();
      if (!ctx) {
        return;
      }

      const targetEntry = findUserByUserId(ctx.active, userId);
      if (!targetEntry) {
        return;
      }

      const [targetSocketId] = targetEntry;

      // 대상에게 추방 알림
      io.to(targetSocketId).emit("member:kicked", {
        reason: "워크스페이스에서 추방되었습니다",
      });

      // 대상을 룸에서 제거
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.leave(ctx.workspaceId);
      }

      // 인메모리 상태에서 제거
      ctx.active.users.delete(targetSocketId);

      // 나머지 유저에게 퇴장 알림
      socket.to(ctx.workspaceId).emit("user:left", { userId: targetSocketId });

      logger.info("socket-handlers", "member:kick", {
        workspaceId: ctx.workspaceId,
        kickedBy: ctx.user.userId,
        targetUserId: userId,
      });
    });

    // 워크스페이스 삭제 (소켓 정리)
    socket.on("workspace:delete", async () => {
      const ctx = requireOwner();
      if (!ctx) {
        return;
      }

      // 본인 제외 모든 유저에게 삭제 알림
      socket.to(ctx.workspaceId).emit("workspace:deleted");

      // 모든 소켓을 룸에서 제거
      const sockets = await io.in(ctx.workspaceId).fetchSockets();
      for (const s of sockets) {
        s.leave(ctx.workspaceId);
      }

      // 인메모리 상태 정리
      await flushPendingSave(ctx.workspaceId);
      activeWorkspaces.delete(ctx.workspaceId);

      logger.info("socket-handlers", "workspace:delete", {
        workspaceId: ctx.workspaceId,
        deletedBy: ctx.user.userId,
      });
    });

    // 커서 이동
    socket.on("cursor:move", ({ x, y }) => {
      if (!currentWorkspaceId || !cursorLimiter(socket.id)) {
        return;
      }

      if (!isValidNumber(x) || !isValidNumber(y)) {
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
