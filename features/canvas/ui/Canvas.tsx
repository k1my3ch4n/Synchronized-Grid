"use client";

import { useDroppable } from "@dnd-kit/core";
import { useCanvasStore } from "../model/store";
import { CanvasItem } from "./CanvasItem";

export function Canvas() {
  const { viewport } = useCanvasStore();
  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 relative bg-gray-200 overflow-auto ${isOver ? "bg-blue-50" : ""}`}
      style={{ minHeight: "100vh" }}
    >
      {viewport.map((item) => (
        <CanvasItem key={item.id} item={item} />
      ))}
    </div>
  );
}
