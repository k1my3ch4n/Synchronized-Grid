"use client";

import { usePresetStore } from "@entities/viewport";
import { PaletteItem } from "./PaletteItem";
import { PaletteAddForm } from "./PaletteAddForm";

export function Palette() {
  const { presets } = usePresetStore();

  return (
    <div className="w-48 bg-win98-gray win98-raised p-2 flex flex-col gap-2">
      <h2 className="font-bold text-xs px-1">Viewports</h2>
      {presets.map((viewport) => (
        <PaletteItem key={viewport.id} viewport={viewport} />
      ))}
      <PaletteAddForm />
    </div>
  );
}
