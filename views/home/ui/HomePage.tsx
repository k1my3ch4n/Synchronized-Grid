"use client";

import { CanvasEditor } from "@/widgets/canvas";
import { UrlInput, useUrlStore } from "@features/url-input";

export function HomePage() {
  const { url } = useUrlStore();

  if (!url) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          검색할 페이지를 입력해 주세요.
        </h1>
        <UrlInput />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <UrlInput />
      <CanvasEditor />
    </main>
  );
}
