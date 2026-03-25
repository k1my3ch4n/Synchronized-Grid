import { create } from "zustand";

interface ScrollSyncState {
  enabled: boolean;
  toggle: () => void;
  frameRefs: Map<string, HTMLIFrameElement>;
  registerFrame: (id: string, iframe: HTMLIFrameElement) => void;
  unregisterFrame: (id: string) => void;
}

export const useScrollSyncStore = create<ScrollSyncState>((set, get) => ({
  enabled: true,
  toggle: () => set((s) => ({ enabled: !s.enabled })),
  frameRefs: new Map(),
  registerFrame: (id, iframe) => {
    const refs = new Map(get().frameRefs);
    refs.set(id, iframe);
    set({ frameRefs: refs });
  },
  unregisterFrame: (id) => {
    const refs = new Map(get().frameRefs);
    refs.delete(id);
    set({ frameRefs: refs });
  },
}));
