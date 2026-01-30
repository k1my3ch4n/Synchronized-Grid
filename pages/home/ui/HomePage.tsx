"use client";

import { useState } from "react";
import { VIEWPORT_PRESETS, ViewportFrame } from "@entities/viewport";

const url = "https://example.com";

export function HomePage() {
  const [selectedIds, setSelectedIds] = useState([
    "desktop",
    "tablet",
    "mobile",
  ]);

  const toggleViewport = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  const selectedViewports = VIEWPORT_PRESETS.filter((v) =>
    selectedIds.includes(v.id),
  );

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">Synchronized Grid</h1>
      </header>

      {/* 뷰포트 선택 버튼 */}
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
    </main>
  );
}
