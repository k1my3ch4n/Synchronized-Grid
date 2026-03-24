import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CanvasViewport } from "@shared/types";
import { DEBOUNCE_SAVE_MS } from "@shared/constants";
import { logger } from "./logger";

const pendingSaves = new Map<
  string,
  { timer: NodeJS.Timeout; saveFn: () => Promise<void> }
>();
const inFlightSaves = new Map<string, Promise<void>>();

function debouncedSave(
  key: string,
  saveFn: () => Promise<void>,
  delay = DEBOUNCE_SAVE_MS,
) {
  const existing = pendingSaves.get(key);

  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(async () => {
    pendingSaves.delete(key);

    const promise = saveFn()
      .catch((err) => {
        logger.error("workspace-persistence", `Save failed for ${key}`, err);
      })
      .finally(() => {
        inFlightSaves.delete(key);
      });

    inFlightSaves.set(key, promise);
    await promise;
  }, delay);

  pendingSaves.set(key, { timer, saveFn });
}

export async function loadWorkspaceFromDB(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  if (!workspace) {
    return null;
  }

  return {
    id: workspace.id,
    name: workspace.name,
    url: workspace.url,
    viewports: (workspace.viewports as unknown as CanvasViewport[]) || [],
  };
}

export async function saveWorkspaceUrl(workspaceId: string, url: string) {
  try {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { url },
    });
  } catch (err) {
    logger.error(
      "workspace-persistence",
      `URL save failed for ${workspaceId}`,
      err,
    );
  }
}

export function saveWorkspaceViewports(
  workspaceId: string,
  viewports: CanvasViewport[],
) {
  debouncedSave(`${workspaceId}:viewports`, () =>
    prisma.workspace
      .update({
        where: { id: workspaceId },
        data: { viewports: viewports as unknown as Prisma.InputJsonValue },
      })
      .then(() => {}),
  );
}

function flushEntries(keys: string[]) {
  return Promise.all(
    keys.map(async (key) => {
      const entry = pendingSaves.get(key);

      if (entry) {
        clearTimeout(entry.timer);
        pendingSaves.delete(key);

        await entry.saveFn().catch((err) => {
          logger.error(
            "workspace-persistence",
            `Flush save failed for ${key}`,
            err,
          );
        });
      }

      // 타이머가 이미 발동되어 진행 중인 저장도 대기
      const inflight = inFlightSaves.get(key);
      if (inflight) {
        await inflight;
      }
    }),
  );
}

export function flushAllPendingSaves() {
  return flushEntries([...pendingSaves.keys()]);
}

export function flushPendingSave(workspaceId: string) {
  return flushEntries([`${workspaceId}:url`, `${workspaceId}:viewports`]);
}
