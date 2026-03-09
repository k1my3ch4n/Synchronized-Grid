"use client";

import { usePresetStore } from "@entities/viewport";
import { PaletteItem } from "./PaletteItem";
import { PaletteAddForm } from "./PaletteAddForm";

export function Palette() {
  const { presets } = usePresetStore();

  return (
    <div className="w-[220px] glass border-r border-glass-border p-4 flex flex-col gap-2">
      <h2 className="text-label font-medium text-text-muted uppercase tracking-[3px] pb-3 border-b border-glass-border mb-1">
        Viewports
      </h2>
      {presets.map((viewport) => (
        <PaletteItem key={viewport.id} viewport={viewport} />
      ))}
      <PaletteAddForm />
    </div>
  );
}
