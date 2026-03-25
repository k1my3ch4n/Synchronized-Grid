import { Viewport } from "@shared/types";

type ViewportCardVariant = "palette" | "overlay" | "header";

interface ViewportCardProps {
  viewport: Pick<Viewport, "label" | "width" | "height">;
  variant?: ViewportCardVariant;
  className?: string;
}

const variantStyles: Record<ViewportCardVariant, string> = {
  palette:
    "p-3 cursor-grab glass-surface rounded-glass hover:bg-glass-hover hover-lift",
  overlay: "p-3 shadow-lg glass rounded-glass",
  header: "px-2 py-0.5 text-text-secondary text-xs font-medium",
};

export function ViewportCard({
  viewport,
  variant = "palette",
  className = "",
}: ViewportCardProps) {
  const { label, width, height } = viewport;

  if (variant === "header") {
    return (
      <div className={`${variantStyles.header} ${className}`}>
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-xs text-text-primary truncate">
          {label}
        </span>
        <span className="text-[10px] text-text-secondary font-mono tabular-nums shrink-0">
          {width}×{height}
        </span>
      </div>
    </div>
  );
}
