"use client";

import { forwardRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useCanvasStore } from "../model/store";
import { CanvasItem } from "./CanvasItem";

export const Canvas = forwardRef<HTMLDivElement>(function Canvas(_, ref) {
  const { viewport } = useCanvasStore();

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas",
  });

  const setRefs = (node: HTMLDivElement) => {
    setNodeRef(node);

    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div
      ref={setRefs}
      className={`flex-1 relative overflow-auto transition-colors ${
        isOver ? "bg-blue-50" : "bg-gray-100"
      }`}
    >
      {viewport.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          뷰포트를 드래그해서 추가하세요
        </div>
      )}
      {viewport.map((item) => (
        <CanvasItem key={item.id} item={item} />
      ))}
    </div>
  );
});
