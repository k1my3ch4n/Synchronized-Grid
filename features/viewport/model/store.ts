import { create } from "zustand";

interface ViewportSelectorState {
  selectedIds: string[];
  toggleViewport: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;
}

// todo : ids 변경 예정입니다.
export const useViewportStore = create<ViewportSelectorState>((set) => ({
  selectedIds: ["desktop", "tablet", "mobile"],

  toggleViewport: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
}));
