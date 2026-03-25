"use client";

import { useState } from "react";
import { usePresetStore, CATEGORY_LABELS } from "@entities/viewport";
import type { DeviceCategory } from "@shared/types";
import { VIEWPORT_MIN_SIZE, VIEWPORT_MAX_SIZE } from "@shared/constants";

export function PaletteAddForm() {
  const { addPreset } = usePresetStore();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [category, setCategory] = useState<DeviceCategory>("custom");

  const handleSubmit = () => {
    const w = parseInt(width);
    const h = parseInt(height);

    if (!label.trim() || isNaN(w) || isNaN(h)) {
      return;
    }

    const clampedW = Math.min(VIEWPORT_MAX_SIZE, Math.max(VIEWPORT_MIN_SIZE, w));
    const clampedH = Math.min(VIEWPORT_MAX_SIZE, Math.max(VIEWPORT_MIN_SIZE, h));

    addPreset({ label: label.trim(), width: clampedW, height: clampedH, category });
    setLabel("");
    setWidth("");
    setHeight("");
    setCategory("custom");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-3 text-xs rounded-glass border border-dashed border-glass-border text-text-muted text-center transition-all hover:border-accent hover:text-accent hover:bg-accent/5"
      >
        + Add Preset
      </button>
    );
  }

  return (
    <div className="p-3 glass-surface rounded-glass flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="sr-only">프리셋 이름</span>
        <input
          type="text"
          placeholder="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1.5 text-xs glass-input rounded-lg"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="sr-only">카테고리</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DeviceCategory)}
          className="w-full px-2 py-1.5 text-xs glass-input rounded-lg"
        >
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <label className="w-1/2">
          <span className="sr-only">너비</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="W"
            value={width}
            onChange={(e) => setWidth(e.target.value.replace(/\D/g, ""))}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1.5 text-xs glass-input rounded-lg"
          />
        </label>
        <label className="w-1/2">
          <span className="sr-only">높이</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="H"
            value={height}
            onChange={(e) => setHeight(e.target.value.replace(/\D/g, ""))}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1.5 text-xs glass-input rounded-lg"
          />
        </label>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 text-xs p-1.5 glass-btn rounded-lg"
        >
          OK
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 text-xs p-1.5 glass-btn-secondary rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
