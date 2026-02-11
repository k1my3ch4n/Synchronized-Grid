import { GRID_SIZE } from "@shared/constants";

export function snapToGrid(value: number): number {
  return Math.round(Math.max(0, value) / GRID_SIZE) * GRID_SIZE;
}

export function snapToGridWithMinimum(
  value: number,
  minimum: number = GRID_SIZE,
): number {
  return Math.round(Math.max(minimum, value) / GRID_SIZE) * GRID_SIZE;
}
