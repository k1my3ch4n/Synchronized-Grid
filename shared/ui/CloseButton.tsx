interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseButton({ onClick, className = "" }: CloseButtonProps) {
  return (
    <button
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex items-center justify-center w-[18px] h-[18px] rounded-full text-text-muted text-caption leading-none bg-surface hover:bg-gd-rose/20 hover:text-gd-rose transition-all ${className}`}
    >
      ✕
    </button>
  );
}
