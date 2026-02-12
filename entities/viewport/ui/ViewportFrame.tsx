"use client";

import { SizeInput } from "@shared/ui/SizeInput";

interface ViewportFrameProps {
  url: string;
  width: number;
  height: number;
  label: string;
  scale?: number;
  onSizeChange?: (width: number, height: number) => void;
}

export function ViewportFrame({
  url,
  width,
  height,
  label,
  scale = 0.3,
  onSizeChange,
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
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 text-sm font-medium text-gray-600 whitespace-nowrap flex items-center gap-1">
          <span>{label}</span>
          {onSizeChange ? (
            <SizeInput
              width={width}
              height={height}
              onSizeChange={onSizeChange}
            />
          ) : (
            <span>
              ({width}x{height})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
