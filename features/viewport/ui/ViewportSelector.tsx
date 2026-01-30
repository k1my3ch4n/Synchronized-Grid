"use client";

import { VIEWPORT_PRESETS } from "@entities/viewport";

interface ViewportSelectorProps {
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function ViewportSelector({
  selectedIds,
  onToggle,
}: ViewportSelectorProps) {
  return (
    <div className="flex gap-2 p-4">
      {VIEWPORT_PRESETS.map((viewport) => {
        const isSelected = selectedIds.includes(viewport.id);
        return (
          <button
            key={viewport.id}
            onClick={() => onToggle(viewport.id)}
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
