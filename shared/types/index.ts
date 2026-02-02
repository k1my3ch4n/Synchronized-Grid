export interface Viewport {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface CanvasViewport {
  id: string;
  presetId: string;
  label: string;
  width: number;
  height: number;
  x: number;
  y: number;
}
