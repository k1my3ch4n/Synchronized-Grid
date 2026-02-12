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
      className={`flex items-center justify-center w-4 h-3.5 text-black text-[10px] leading-none bg-win98-gray win98-btn ${className}`}
    >
      ✕
    </button>
  );
}
