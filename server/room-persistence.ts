import { prisma } from "../lib/prisma";
import type { CanvasViewport } from "@shared/types";

const saveTimers = new Map<string, NodeJS.Timeout>();

function debouncedSave(
  roomId: string,
  saveFn: () => Promise<void>,
  delay = 500,
) {
  const existing = saveTimers.get(roomId);
  if (existing) clearTimeout(existing);

  saveTimers.set(
    roomId,
    setTimeout(async () => {
      saveTimers.delete(roomId);

      try {
        await saveFn();
      } catch (err) {
        console.error(`[room-persistence] Save failed for ${roomId}:`, err);
      }
    }, delay),
  );
}

export async function loadRoomFromDB(roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });

  if (!room) {
    return null;
  }

  return {
    id: room.id,
    name: room.name,
    url: room.url,
    viewports: (room.viewports as unknown as CanvasViewport[]) || [],
    workspaceId: room.workspaceId,
  };
}

export function saveRoomUrl(roomId: string, url: string) {
  debouncedSave(roomId, () =>
    prisma.room.update({ where: { id: roomId }, data: { url } }).then(() => {}),
  );
}

export function saveRoomViewports(roomId: string, viewports: CanvasViewport[]) {
  debouncedSave(roomId, () =>
    prisma.room
      .update({
        where: { id: roomId },
        data: { viewports: JSON.parse(JSON.stringify(viewports)) },
      })
      .then(() => {}),
  );
}

export function cleanupTimers(roomId: string) {
  const timer = saveTimers.get(roomId);

  if (timer) {
    clearTimeout(timer);
    saveTimers.delete(roomId);
  }
}
