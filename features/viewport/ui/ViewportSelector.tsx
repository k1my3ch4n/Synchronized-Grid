"use client";

import { VIEWPORT_PRESETS } from "@entities/viewport";
import { useViewportStore } from "../model/store";

export function ViewportSelector({}) {
  const { selectedIds, toggleViewport } = useViewportStore();

  return (
    <div className="flex gap-2 p-4">
      {VIEWPORT_PRESETS.map((viewport) => {
        const isSelected = selectedIds.includes(viewport.id);
        return (
          <button
            key={viewport.id}
            onClick={() => toggleViewport(viewport.id)}
            className={`px-4 py-2 rounded-lg border-2 transition-colors ${
              isSelected
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
            }`}
          >
            {viewport.label}
          </button>
        );
      })}
    </div>
  );
}
