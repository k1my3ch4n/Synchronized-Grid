"use client";

import { useState } from "react";
import type { Viewport } from "@shared/types";
import { PaletteItem } from "./PaletteItem";

interface PaletteGroupProps {
  label: string;
  presets: Viewport[];
  defaultOpen?: boolean;
}

export function PaletteGroup({
  label,
  presets,
  defaultOpen = true,
}: PaletteGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (presets.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-1 py-1.5 text-label text-text-muted uppercase tracking-wider hover:text-text-secondary transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
            fill="currentColor"
          >
            <path d="M3 1l4 4-4 4" />
          </svg>
          <span>{label}</span>
        </div>
        <span className="text-text-muted/60">{presets.length}</span>
      </button>
      {isOpen && (
        <div className="flex flex-col gap-1 mt-1">
          {presets.map((viewport) => (
            <PaletteItem key={viewport.id} viewport={viewport} />
          ))}
        </div>
      )}
    </div>
  );
}
