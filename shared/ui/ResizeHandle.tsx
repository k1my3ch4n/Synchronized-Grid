interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ResizeHandle({ onPointerDown }: ResizeHandleProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize z-20 opacity-40 hover:opacity-80 transition-opacity border-r-2 border-b-2 border-text-secondary rounded-br-sm"
      title="드래그하여 크기 조절"
    />
  );
}
