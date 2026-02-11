import { Viewport } from "@shared/types";

type ViewportCardVariant = "palette" | "overlay" | "header";

interface ViewportCardProps {
  viewport: Pick<Viewport, "label" | "width" | "height">;
  variant?: ViewportCardVariant;
  className?: string;
}

const variantStyles: Record<ViewportCardVariant, string> = {
  palette: "p-3 transition-all cursor-grab bg-win98-gray win98-raised",
  overlay: "p-3 shadow-lg bg-win98-gray win98-raised",
  header:
    "px-1.5 py-0.5 text-white text-xs font-bold bg-linear-to-r from-win98-title-from to-win98-title-to",
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
      <div className="font-bold text-sm">{label}</div>
      <div className="text-xs text-win98-text">
        {width} × {height}
      </div>
    </div>
  );
}
