"use client";

import { useState } from "react";
import { VIEWPORT_PRESETS } from "@entities/viewport";
import { ViewportSelector } from "@features/viewport";
import { ViewportGrid } from "@widgets/viewport";
import { Header } from "@widgets/header";
import { UrlInput } from "@/features/url-input";

const EXAMPLE_URL = "https://www.google.com/";

export function HomePage() {
  const [selectedIds, setSelectedIds] = useState([
    "desktop",
    "tablet",
    "mobile",
  ]);
  const [url, setUrl] = useState(EXAMPLE_URL);

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

      <UrlInput initialUrl={url} onSubmit={setUrl} />

      <ViewportSelector selectedIds={selectedIds} onToggle={toggleViewport} />

      <ViewportGrid url={url} viewports={selectedViewports} />
    </main>
  );
}
