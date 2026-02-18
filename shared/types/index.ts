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
  zIndex: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
}

export interface RoomUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}
