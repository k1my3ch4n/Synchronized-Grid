"use client";

import { useEffect, useState } from "react";

interface EditableUrlProps {
  url: string;
  onUrlChange: (url: string) => void;
}

export function EditableUrl({ url, onUrlChange }: EditableUrlProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(url);

  const handleEdit = () => {
    setInputUrl(url);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    const trimmedUrl = inputUrl.trim();

    if (trimmedUrl) {
      onUrlChange(trimmedUrl);
    }

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }

    if (e.key === "Escape") {
      setInputUrl(url);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    setInputUrl(url);
  }, [url]);

  if (isEditing) {
    return (
      <input
        type="url"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        autoFocus
        className="bg-transparent px-1 py-0.5 w-full focus:outline-none text-sm text-text-secondary font-mono"
      />
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="text-sm truncate w-full flex items-center gap-2 text-text-secondary font-mono group"
    >
      <span className="truncate">{url}</span>
      <svg
        className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60 transition-opacity"
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M12.1 1.3a1.5 1.5 0 0 1 2.1 2.1L5.6 12 2 13l1-3.6 9.1-9.1z" />
      </svg>
    </button>
  );
}
