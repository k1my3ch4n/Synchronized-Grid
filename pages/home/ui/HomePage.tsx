"use client";

import { VIEWPORT_PRESETS } from "@/entities/viewport";
import { useState } from "react";

export function HomePage() {
  const [selectedIds, setSelectedIds] = useState([
    "desktop",
    "tablet",
    "mobile",
  ]);
  const url = "https://example.com";
  const scale = 0.3;

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

      {/* 뷰포트 그리드 */}
      <div className="flex gap-6 p-6 overflow-x-auto items-start justify-center">
        {selectedViewports.map((viewport) => (
          <div key={viewport.id} className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {viewport.label} ({viewport.width}x{viewport.height})
            </span>
            <div
              className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
              style={{
                width: `${viewport.width * scale}px`,
                height: `${viewport.height * scale}px`,
              }}
            >
              <iframe
                src={url}
                width={viewport.width}
                height={viewport.height}
                className="border-0 origin-top-left"
                style={{ transform: `scale(${scale})` }}
                title={viewport.label}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
