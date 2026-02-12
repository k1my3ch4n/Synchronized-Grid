"use client";

import { useState } from "react";
import { usePresetStore } from "@entities/viewport";

export function PaletteAddForm() {
  const { addPreset } = usePresetStore();
  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  const handleSubmit = () => {
    const w = parseInt(width);
    const h = parseInt(height);

    if (!label.trim() || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      return;
    }

    addPreset({ label: label.trim(), width: w, height: h });
    setLabel("");
    setWidth("");
    setHeight("");
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
        className="w-full p-2 text-xs bg-win98-gray win98-btn text-center"
      >
        + Add Preset
      </button>
    );
  }

  return (
    <div className="p-2 bg-win98-gray win98-sunken flex flex-col gap-1">
      <input
        type="text"
        placeholder="Label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-1 py-0.5 text-xs win98-sunken"
      />
      <div className="flex gap-1">
        <input
          type="number"
          placeholder="W"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-1/2 px-1 py-0.5 text-xs win98-sunken"
        />
        <input
          type="number"
          placeholder="H"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-1/2 px-1 py-0.5 text-xs win98-sunken"
        />
      </div>
      <div className="flex gap-1">
        <button
          onClick={handleSubmit}
          className="flex-1 text-xs p-1 bg-win98-gray win98-btn"
        >
          OK
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 text-xs p-1 bg-win98-gray win98-btn"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
