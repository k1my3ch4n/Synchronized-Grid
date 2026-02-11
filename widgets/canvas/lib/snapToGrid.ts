import { GRID_SIZE } from "@shared/constants";
import { Modifier } from "@dnd-kit/core";

export function snapToGrid(value: number): number {
  return Math.round(Math.max(0, value) / GRID_SIZE) * GRID_SIZE;
}

export const snapToGridModifier: Modifier = ({ transform }) => ({
  ...transform,
  x: Math.round(transform.x / GRID_SIZE) * GRID_SIZE,
  y: Math.round(transform.y / GRID_SIZE) * GRID_SIZE,
});
