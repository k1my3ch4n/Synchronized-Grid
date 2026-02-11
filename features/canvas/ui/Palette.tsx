"use client";

import { VIEWPORT_PRESETS } from "@entities/viewport";
import { PaletteItem } from "./PaletteItem";

export function Palette() {
  return (
    <div className="w-48 bg-win98-gray win98-raised p-2 flex flex-col gap-2">
      <h2 className="font-bold text-xs px-1">Viewports</h2>
      {VIEWPORT_PRESETS.map((viewport) => (
        <PaletteItem key={viewport.id} viewport={viewport} />
      ))}
    </div>
  );
}
