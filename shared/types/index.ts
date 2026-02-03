export interface Viewport {
  id: string;
  label: string;
  width: number;
  height: number;
}

export interface CanvasViewport extends Viewport {
  presetId: string;
  x: number;
  y: number;
}
