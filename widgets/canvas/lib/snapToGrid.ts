import { GRID_SIZE } from "@shared/constants";
import { Modifier } from "@dnd-kit/core";

export const snapToGridModifier: Modifier = ({ transform }) => ({
  ...transform,
  x: Math.round(transform.x / GRID_SIZE) * GRID_SIZE,
  y: Math.round(transform.y / GRID_SIZE) * GRID_SIZE,
});
