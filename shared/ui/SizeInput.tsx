"use client";

import { useState } from "react";

interface SizeInputProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
}

function EditableValue({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));

  const handleOpen = () => {
    setInputValue(String(value));
    setIsEditing(true);
  };

  const handleSubmit = () => {
    const parsed = parseInt(inputValue);

    if (!isNaN(parsed) && parsed > 0) {
      onValueChange(parsed);
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }

    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-14 px-0.5 text-sm text-center text-black win98-sunken"
      />
    );
  }

  return (
    <button
      onClick={handleOpen}
      onPointerDown={(e) => e.stopPropagation()}
      className="hover:underline cursor-pointer"
    >
      {value}
    </button>
  );
}

export function SizeInput({ width, height, onSizeChange }: SizeInputProps) {
  return (
    <span className="flex items-center gap-0.5">
      (
      <EditableValue
        value={width}
        onValueChange={(w) => onSizeChange(w, height)}
      />
      ×
      <EditableValue
        value={height}
        onValueChange={(h) => onSizeChange(width, h)}
      />
      )
    </span>
  );
}
