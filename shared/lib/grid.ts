import { GRID_SIZE } from "@shared/constants";

export function snapToGrid(value: number): number {
  return Math.round(Math.max(0, value) / GRID_SIZE) * GRID_SIZE;
}
