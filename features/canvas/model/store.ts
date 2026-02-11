import { create } from "zustand";
import { CanvasViewport } from "@shared/types";

interface CanvasState {
  viewport: CanvasViewport[];
  addViewport: (viewport: Omit<CanvasViewport, "id" | "zIndex">) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  removeViewport: (id: string) => void;
  updateSize: (id: string, width: number, height: number) => void;
  updateZIndex: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: [],

  addViewport: (viewport) =>
    set((state) => {
      const maxZ = Math.max(...state.viewport.map((v) => v.zIndex), -1);

      return {
        viewport: [
          ...state.viewport,
          {
            ...viewport,
            id: crypto.randomUUID(),
            zIndex: maxZ + 1,
          },
        ],
      };
    }),

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

  updateZIndex: (id) =>
    set((state) => {
      const maxZ = Math.max(...state.viewport.map((v) => v.zIndex), 0);

      return {
        viewport: state.viewport.map((v) =>
          v.id === id ? { ...v, zIndex: maxZ + 1 } : v,
        ),
      };
    }),
}));
