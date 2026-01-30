"use client";

import { ViewportFrame } from "@entities/viewport";
import type { Viewport } from "@shared/types";

interface ViewportGridProps {
  url: string;
  viewports: Viewport[];
}

export function ViewportGrid({ url, viewports }: ViewportGridProps) {
  return (
    <div className="flex gap-6 p-6 overflow-x-auto items-start justify-center">
      {viewports.map((viewport) => (
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
