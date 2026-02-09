"use client";

import { CanvasEditor } from "@/widgets/canvas";
import { UrlInput } from "@features/url-input";
import { Header } from "@widgets/header";

export function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header title="Synchronized Grid" />
      <UrlInput />
      <CanvasEditor />
    </main>
  );
}
