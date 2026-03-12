interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ResizeHandle({ onPointerDown }: ResizeHandleProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-20 opacity-0 hover:opacity-70 transition-opacity"
      title="드래그하여 크기 조절"
    >
      <svg
        className="absolute bottom-1 right-1"
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
      >
        <path
          d="M8 0L8 8L0 8"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-text-secondary"
        />
        <path
          d="M8 4L8 8L4 8"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-text-secondary"
        />
      </svg>
    </div>
  );
}
