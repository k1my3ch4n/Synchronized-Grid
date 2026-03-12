import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CanvasViewport } from "@shared/types";

const pendingSaves = new Map<
  string,
  { timer: NodeJS.Timeout; saveFn: () => Promise<void> }
>();

function debouncedSave(key: string, saveFn: () => Promise<void>, delay = 500) {
  const existing = pendingSaves.get(key);

  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(async () => {
    pendingSaves.delete(key);

    try {
      await saveFn();
    } catch (err) {
      console.error(`[room-persistence] Save failed for ${key}:`, err);
    }
  }, delay);

  pendingSaves.set(key, { timer, saveFn });
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
  debouncedSave(`${roomId}:url`, () =>
    prisma.room.update({ where: { id: roomId }, data: { url } }).then(() => {}),
  );
}

export function saveRoomViewports(roomId: string, viewports: CanvasViewport[]) {
  debouncedSave(`${roomId}:viewports`, () =>
    prisma.room
      .update({
        where: { id: roomId },
        data: { viewports: viewports as unknown as Prisma.InputJsonValue },
      })
      .then(() => {}),
  );
}

export async function flushPendingSave(roomId: string) {
  const keys = [`${roomId}:url`, `${roomId}:viewports`];
  const flushPromises: Promise<void>[] = [];

  for (const key of keys) {
    const entry = pendingSaves.get(key);

    if (entry) {
      clearTimeout(entry.timer);
      pendingSaves.delete(key);
      flushPromises.push(
        entry.saveFn().catch((err) => {
          console.error(
            `[room-persistence] Flush save failed for ${key}:`,
            err,
          );
        }),
      );
    }
  }

  await Promise.all(flushPromises);
}
