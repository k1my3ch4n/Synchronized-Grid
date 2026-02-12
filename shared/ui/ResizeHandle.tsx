interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ResizeHandle({ onPointerDown }: ResizeHandleProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-20 bg-win98-gray win98-btn"
      title="드래그하여 크기 조절"
    />
  );
}
