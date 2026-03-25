"use client";

import { useState } from "react";
import { usePresetStore, CATEGORY_LABELS } from "@entities/viewport";
import type { DeviceCategory } from "@shared/types";

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

    if (!label.trim() || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      return;
    }

    addPreset({ label: label.trim(), width: w, height: h, category });
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
        className="w-full p-3 text-xs rounded-glass border border-dashed border-glass-border text-text-muted text-center transition-all hover:border-accent hover:text-accent hover:bg-accent/5 cursor-pointer"
      >
        + Add Preset
      </button>
    );
  }

  return (
    <div className="p-3 glass-surface rounded-glass flex flex-col gap-2">
      <input
        type="text"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-2 py-1.5 text-xs glass-input rounded-lg"
      />
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
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="W"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-1/2 px-2 py-1.5 text-xs glass-input rounded-lg"
        />
        <input
          type="number"
          placeholder="H"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-1/2 px-2 py-1.5 text-xs glass-input rounded-lg"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="flex-1 text-xs p-1.5 glass-btn rounded-lg cursor-pointer"
        >
          OK
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 text-xs p-1.5 glass-btn-secondary rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
