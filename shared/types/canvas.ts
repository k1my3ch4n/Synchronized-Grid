export type DeviceCategory = "phone" | "tablet" | "desktop" | "custom";

export interface Viewport {
  id: string;
  label: string;
  width: number;
  height: number;
  category?: DeviceCategory;
}

export interface CanvasViewport extends Viewport {
  presetId: string;
  x: number;
  y: number;
  zIndex: number;
}
