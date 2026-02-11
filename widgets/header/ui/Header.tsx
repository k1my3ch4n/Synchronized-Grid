"use client";

import { useEffect, useState } from "react";
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
    const trimmedUrl = inputUrl.trim();

    if (trimmedUrl) {
      setUrl(trimmedUrl);
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

  return (
    <header className="h-16 px-4 bg-win98-gray win98-raised flex items-center relative">
      <h1 className="text-sm font-bold">{title}</h1>

      {url && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="bg-white win98-sunken px-4 py-1.5 w-[350px]">
            {isEditing ? (
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                autoFocus
                className="bg-white px-2 py-0.5 w-full focus:outline-none text-sm"
              />
            ) : (
              <button
                onClick={handleEdit}
                className="text-sm truncate w-full flex items-center gap-2"
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
