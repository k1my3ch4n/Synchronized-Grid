"use client";

import { CanvasEditor } from "@/widgets/canvas";
import { UrlInput, useUrlStore } from "@features/url-input";

export function HomePage() {
  const { url } = useUrlStore();

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-100">
      {!url ? (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <UrlInput />
        </div>
      ) : (
        <CanvasEditor />
      )}
    </main>
  );
}
