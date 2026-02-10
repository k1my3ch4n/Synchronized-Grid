import { create } from "zustand";
import { CanvasViewport } from "@shared/types";

interface CanvasState {
  viewport: CanvasViewport[];
  addViewport: (viewport: Omit<CanvasViewport, "id">) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  removeViewport: (id: string) => void;
  updateSize: (id: string, width: number, height: number) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: [],

  addViewport: (viewport) =>
    set((state) => ({
      viewport: [...state.viewport, { ...viewport, id: crypto.randomUUID() }],
    })),

  updatePosition: (id, x, y) =>
    set((state) => ({
      viewport: state.viewport.map((v) => (v.id === id ? { ...v, x, y } : v)),
    })),

  removeViewport: (id) =>
    set((state) => ({
      viewport: state.viewport.filter((v) => v.id !== id),
    })),

  updateSize: (id, width, height) =>
    set((state) => ({
      viewport: state.viewport.map((v) =>
        v.id === id ? { ...v, width, height } : v,
      ),
    })),
}));
