"use client";

import { useState } from "react";
import { VIEWPORT_PRESETS } from "@entities/viewport";
import { ViewportSelector } from "@features/viewport";
import { ViewportGrid } from "@widgets/viewport";

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

      <ViewportGrid url={url} viewports={selectedViewports} />
    </main>
  );
}
