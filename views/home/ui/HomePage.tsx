"use client";

import { CanvasEditor } from "@widgets/canvas";
import { UrlInput, useUrlStore } from "@features/url-input";

export function HomePage() {
  const { url } = useUrlStore();

  return (
    <main className="page-height">
      {!url ? (
        <div className="flex items-center justify-center page-height">
          <UrlInput />
        </div>
      ) : (
        <CanvasEditor />
      )}
    </main>
  );
}
