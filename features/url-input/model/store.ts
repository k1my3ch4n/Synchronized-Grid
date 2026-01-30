import { create } from "zustand";

interface UrlState {
  url: string;
  setUrl: (url: string) => void;
}

export const useUrlStore = create<UrlState>((set) => ({
  url: "https://example.com",
  setUrl: (url) => set({ url }),
}));
