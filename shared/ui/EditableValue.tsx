"use client";

import { useEditableValue } from "@shared/hooks/useEditableValue";

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
  const {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    submit,
    handleKeyDown,
  } = useEditableValue(value, onValueChange);

  if (isEditing) {
    return (
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={submit}
        onKeyDown={handleKeyDown}
        autoFocus
        className={inputClassName}
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      onPointerDown={(e) => e.stopPropagation()}
      className={`cursor-pointer ${className}`}
    >
      {value}
    </button>
  );
}
