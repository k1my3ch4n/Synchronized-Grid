import type { Viewport } from "@shared/types";

export const VIEWPORT_PRESETS: Viewport[] = [
  { id: "desktop", label: "Desktop", width: 1920, height: 1080 },
  { id: "tablet", label: "Tablet", width: 768, height: 1024 },
  { id: "mobile", label: "Mobile", width: 375, height: 667 },
];
