"use client";

import { useState } from "react";
import { useUrlStore } from "@features/url-input";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { url, setUrl } = useUrlStore();
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(url);

  const handleEdit = () => {
    setInputUrl(url);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    if (inputUrl.trim()) {
      setUrl(inputUrl);
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

  return (
    <header className="h-16 px-4 bg-white shadow flex items-center relative">
      <h1 className="text-2xl font-bold">{title}</h1>

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm w-[350px]">
            {isEditing ? (
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-white px-3 py-1 border rounded focus:outline-none focus:border-blue-500 w-full"
              />
            ) : (
              <button
                onClick={handleEdit}
                className="text-gray-700 hover:text-gray-900 truncate w-full flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                <span className="truncate">{url}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
