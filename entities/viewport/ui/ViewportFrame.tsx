"use client";

interface ViewportFrameProps {
  url: string;
  width: number;
  height: number;
  label: string;
  scale?: number;
}

export function ViewportFrame({
  url,
  width,
  height,
  label,
  scale = 0.3,
}: ViewportFrameProps) {
  return (
    <div className="relative">
      <div
        className="overflow-hidden bg-white win98-sunken border border-win98-text"
        style={{
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        }}
      >
        <iframe
          src={url}
          width={width}
          height={height}
          className="border-0 origin-top-left"
          style={{ transform: `scale(${scale})` }}
          title={label}
        />
      </div>
      {label && (
        <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-sm font-medium text-gray-600 whitespace-nowrap">
          {label} ({width}x{height})
        </span>
      )}
    </div>
  );
}
