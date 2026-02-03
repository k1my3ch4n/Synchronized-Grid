"use client";

import { UrlInput } from "@features/url-input";
import { ViewportSelector } from "@features/viewport";
import { Header } from "@widgets/header";
import { ViewportGrid } from "@widgets/viewport";

export function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Header title="Synchronized Grid" />
      <UrlInput />
      <ViewportSelector />
      <ViewportGrid />
    </main>
  );
}
