"use client";

import { useState } from "react";
import { VIEWPORT_PRESETS } from "@entities/viewport";
import { ViewportSelector } from "@features/viewport";
import { ViewportGrid } from "@widgets/viewport";
import { Header } from "@widgets/header";

const url = "https://example.com";

export function HomePage() {
  const [selectedIds, setSelectedIds] = useState([
    "desktop",
    "tablet",
    "mobile",
  ]);

  const toggleViewport = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const selectedViewports = VIEWPORT_PRESETS.filter((selected) =>
    selectedIds.includes(selected.id),
  );

  return (
    <main className="min-h-screen bg-gray-100">
      <Header title="Synchronized Grid" />

      <ViewportSelector selectedIds={selectedIds} onToggle={toggleViewport} />

      <ViewportGrid url={url} viewports={selectedViewports} />
    </main>
  );
}
