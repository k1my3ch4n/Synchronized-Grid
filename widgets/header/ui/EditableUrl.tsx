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
        className="bg-white px-2 py-0.5 w-full focus:outline-none text-sm"
      />
    );
  }

  return (
    <button
      onClick={handleEdit}
      className="text-sm truncate w-full flex items-center gap-2"
    >
      <span>🔗</span>
      <span className="truncate">{url}</span>
    </button>
  );
}
