import { create } from "zustand";
import type { Viewport } from "@shared/types";
import { VIEWPORT_PRESETS } from "../lib";

interface PresetState {
  presets: Viewport[];
  addPreset: (preset: Omit<Viewport, "id">) => void;
  updatePreset: (id: string, updates: Partial<Omit<Viewport, "id">>) => void;
  removePreset: (id: string) => void;
}

export const usePresetStore = create<PresetState>((set) => ({
  presets: VIEWPORT_PRESETS,

  addPreset: (preset) =>
    set((state) => ({
      presets: [...state.presets, { ...preset, id: crypto.randomUUID() }],
    })),

  updatePreset: (id, updates) =>
    set((state) => ({
      presets: state.presets.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  removePreset: (id) =>
    set((state) => ({
      presets: state.presets.filter((p) => p.id !== id),
    })),
}));
