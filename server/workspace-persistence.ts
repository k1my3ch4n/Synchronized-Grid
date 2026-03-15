import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CanvasViewport } from "@shared/types";
import { DEBOUNCE_SAVE_MS } from "@shared/constants";
import { logger } from "./logger";

const pendingSaves = new Map<
  string,
  { timer: NodeJS.Timeout; saveFn: () => Promise<void> }
>();

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

    try {
      await saveFn();
    } catch (err) {
      logger.error("workspace-persistence", `Save failed for ${key}`, err);
    }
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

export function saveWorkspaceUrl(workspaceId: string, url: string) {
  debouncedSave(`${workspaceId}:url`, () =>
    prisma.workspace
      .update({ where: { id: workspaceId }, data: { url } })
      .then(() => {}),
  );
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
    keys.map((key) => {
      const entry = pendingSaves.get(key);

      if (!entry) {
        return;
      }

      clearTimeout(entry.timer);
      pendingSaves.delete(key);

      return entry.saveFn().catch((err) => {
        logger.error(
          "workspace-persistence",
          `Flush save failed for ${key}`,
          err,
        );
      });
    }),
  );
}

export function flushAllPendingSaves() {
  return flushEntries([...pendingSaves.keys()]);
}

export function flushPendingSave(workspaceId: string) {
  return flushEntries([`${workspaceId}:url`, `${workspaceId}:viewports`]);
}
