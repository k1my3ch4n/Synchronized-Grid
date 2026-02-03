import { Viewport } from "@shared/types";

type ViewportCardVariant = "palette" | "overlay" | "header";

interface ViewportCardProps {
  viewport: Pick<Viewport, "label" | "width" | "height">;
  variant?: ViewportCardVariant;
  className?: string;
}

const variantStyles: Record<ViewportCardVariant, string> = {
  palette:
    "p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all",
  overlay: "p-3 bg-white border-2 border-blue-400 rounded-lg shadow-lg",
  header: "px-2 py-1 bg-gray-700 text-white text-xs rounded-t",
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
      <div className="font-medium text-sm">{label}</div>
      <div className="text-xs text-gray-500">
        {width} × {height}
      </div>
    </div>
  );
}
