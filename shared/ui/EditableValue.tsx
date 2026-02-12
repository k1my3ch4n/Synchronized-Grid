"use client";

import { useState } from "react";

interface EditableValueProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

export function EditableValue({
  value,
  onValueChange,
  className = "",
  inputClassName = "",
}: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleOpen = () => {
    setInputValue(value);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onValueChange(inputValue.trim());
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
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        className={inputClassName}
      />
    );
  }

  return (
    <button
      onClick={handleOpen}
      onPointerDown={(e) => e.stopPropagation()}
      className={className}
    >
      {value}
    </button>
  );
}
