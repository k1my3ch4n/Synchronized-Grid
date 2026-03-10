import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Viewport } from "@shared/types";
import { VIEWPORT_PRESETS } from "../lib";

interface PresetState {
  presets: Viewport[];
  addPreset: (preset: Omit<Viewport, "id">) => void;
  updatePreset: (id: string, updates: Partial<Omit<Viewport, "id">>) => void;
  removePreset: (id: string) => void;
  resetPresets: () => void;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set) => ({
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

      resetPresets: () => set({ presets: VIEWPORT_PRESETS }),
    }),
    {
      name: "syngrid-presets",
      partialize: (state) => ({ presets: state.presets }),
    },
  ),
);
