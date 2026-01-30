"use client";

import { useState } from "react";
import { VIEWPORT_PRESETS, ViewportFrame } from "@entities/viewport";
import { ViewportSelector } from "@features/viewport";

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

      <ViewportSelector selectedIds={selectedIds} onToggle={toggleViewport} />

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
