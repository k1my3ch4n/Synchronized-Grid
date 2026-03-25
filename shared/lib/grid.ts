import { GRID_SIZE } from "@shared/constants";

export function snapToGrid(value: number): number {
  return Math.round(Math.max(0, value) / GRID_SIZE) * GRID_SIZE;
}

export function ceilToGrid(value: number): number {
  return Math.ceil(value / GRID_SIZE) * GRID_SIZE;
}
