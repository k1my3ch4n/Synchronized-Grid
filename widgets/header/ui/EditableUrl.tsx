"use client";

import { useEffect } from "react";
import { useEditableValue } from "@shared/hooks/useEditableValue";
import { PencilIcon } from "@shared/ui/icons/PencilIcon";

interface EditableUrlProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export function EditableUrl({ url, onUrlChange }: EditableUrlProps) {
  const {
    isEditing,
    inputValue,
    setInputValue,
    startEditing,
    submit,
    handleKeyDown,
  } = useEditableValue(url, onUrlChange);

  useEffect(() => {
    setInputValue(url);
  }, [url, setInputValue]);

  if (isEditing) {
    return (
      <input
        type="url"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={submit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="bg-transparent w-full border-none outline-none focus:outline-none focus:border-none focus-visible:!outline-none text-base text-text-secondary font-mono"
      />
    );
  }

  return (
    <button
      onClick={startEditing}
      className="text-base truncate w-full flex items-center gap-2 text-text-secondary font-mono group cursor-pointer"
    >
      <span className="truncate">{url}</span>
      <PencilIcon className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-opacity" />
    </button>
  );
}
