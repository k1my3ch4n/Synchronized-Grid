import { create } from "zustand";

interface UrlState {
  url: string;
  setUrl: (url: string) => void;
}

export const useUrlStore = create<UrlState>((set) => ({
  url: "",
  setUrl: (url) => set({ url }),
}));
