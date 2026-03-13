import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CanvasViewport } from "@shared/types";
import { DEBOUNCE_SAVE_MS } from "@shared/constants";

const pendingSaves = new Map<
  string,
  { timer: NodeJS.Timeout; saveFn: () => Promise<void> }
>();

function debouncedSave(key: string, saveFn: () => Promise<void>, delay = DEBOUNCE_SAVE_MS) {
  const existing = pendingSaves.get(key);

  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(async () => {
    pendingSaves.delete(key);

    try {
      await saveFn();
    } catch (err) {
      console.error(`[workspace-persistence] Save failed for ${key}:`, err);
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

export async function flushAllPendingSaves() {
  const flushPromises: Promise<void>[] = [];

  for (const [key, entry] of pendingSaves) {
    clearTimeout(entry.timer);
    pendingSaves.delete(key);
    flushPromises.push(
      entry.saveFn().catch((err) => {
        console.error(
          `[workspace-persistence] Flush save failed for ${key}:`,
          err,
        );
      }),
    );
  }

  await Promise.all(flushPromises);
}

export async function flushPendingSave(workspaceId: string) {
  const keys = [`${workspaceId}:url`, `${workspaceId}:viewports`];
  const flushPromises: Promise<void>[] = [];

  for (const key of keys) {
    const entry = pendingSaves.get(key);

    if (entry) {
      clearTimeout(entry.timer);
      pendingSaves.delete(key);
      flushPromises.push(
        entry.saveFn().catch((err) => {
          console.error(
            `[workspace-persistence] Flush save failed for ${key}:`,
            err,
          );
        }),
      );
    }
  }

  await Promise.all(flushPromises);
}
