"use client";

import { VIEWPORT_PRESETS, ViewportFrame } from "@entities/viewport";
import { useViewportStore } from "@features/viewport";
import { useUrlStore } from "@features/url-input";

export function ViewportGrid() {
  const { url } = useUrlStore();
  const { selectedIds } = useViewportStore();

  const selectedViewports = VIEWPORT_PRESETS.filter((viewport) =>
    selectedIds.includes(viewport.id),
  );

  return (
    <div className="flex gap-6 p-6 overflow-x-auto items-start justify-center">
      {selectedViewports.map((viewport) => (
        <ViewportFrame
          key={viewport.id}
          url={url}
          width={viewport.width}
          height={viewport.height}
          label={viewport.label}
        />
      ))}
    </div>
  );
}
