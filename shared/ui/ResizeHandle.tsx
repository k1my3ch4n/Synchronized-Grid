interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
}

export function ResizeHandle({ onPointerDown }: ResizeHandleProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-20 group/resize"
      title="드래그하여 크기 조절"
    >
      <svg
        viewBox="0 0 6 6"
        className="absolute bottom-[5px] right-[5px] w-[6px] h-[6px] transition-opacity"
      >
        <circle
          cx="5"
          cy="1"
          r="0.8"
          className="fill-white/30 group-hover/resize:fill-white/70"
        />
        <circle
          cx="1"
          cy="5"
          r="0.8"
          className="fill-white/30 group-hover/resize:fill-white/70"
        />
        <circle
          cx="5"
          cy="5"
          r="0.8"
          className="fill-white/30 group-hover/resize:fill-white/70"
        />
        <circle
          cx="3"
          cy="5"
          r="0.8"
          className="fill-white/30 group-hover/resize:fill-white/70"
        />
        <circle
          cx="5"
          cy="3"
          r="0.8"
          className="fill-white/30 group-hover/resize:fill-white/70"
        />
      </svg>
    </div>
  );
}
