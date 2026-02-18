"use client";

import { useState } from "react";
import { useSyncedUrl } from "@features/room/hooks/useSyncedUrl";

export function UrlInput() {
  const { url, setUrl } = useSyncedUrl();
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setUrl(inputUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 w-1/3">
      <input
        type="url"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 px-3 py-1.5 bg-white win98-sunken text-sm focus:outline-none"
      />
      <button
        type="submit"
        className="px-6 py-1.5 bg-win98-gray win98-raised text-sm font-bold active:win98-sunken"
      >
        Load
      </button>
    </form>
  );
}
