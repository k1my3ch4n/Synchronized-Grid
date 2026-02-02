"use client";

import { VIEWPORT_PRESETS } from "@entities/viewport";
import { PaletteItem } from "./PaletteItem";

export function Palette() {
  return (
    <div className="w-48 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-sm text-gray-700 mb-2">Viewports</h2>
      {VIEWPORT_PRESETS.map((viewport) => (
        <PaletteItem key={viewport.id} viewport={viewport} />
      ))}
    </div>
  );
}
