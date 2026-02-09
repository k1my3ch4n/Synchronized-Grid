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
    <div className="flex flex-col items-center gap-2">
      <div
        className="border-2 border-gray-300 rounded-b-lg overflow-hidden bg-white"
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
      <span className="text-sm font-medium text-gray-600">
        {label} ({width}x{height})
      </span>
    </div>
  );
}
