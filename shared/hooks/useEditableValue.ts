"use client";

import { useState } from "react";

export function useEditableValue(
  value: string,
  onValueChange: (value: string) => void,
) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const startEditing = () => {
    setInputValue(value);
    setIsEditing(true);
  };

  const submit = () => {
    const trimmed = inputValue.trim();

    if (trimmed) {
      onValueChange(trimmed);
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submit();
    }

    if (e.key === "Escape") {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    submit,
    handleKeyDown,
  };
}
