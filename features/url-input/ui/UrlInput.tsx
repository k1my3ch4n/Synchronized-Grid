"use client";

import { useState } from "react";
import { useSyncedUrl } from "@features/workspace/hooks/useSyncedUrl";

export function UrlInput() {
  const { url, setUrl } = useSyncedUrl();
  const [inputUrl, setInputUrl] = useState(url);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    setUrl(inputUrl);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 w-[95%] max-w-[500px]"
    >
      <input
        type="url"
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        placeholder="https://example.com"
        className="flex-1 px-4 py-2.5 glass-input text-sm rounded-glass font-mono"
      />
      <button type="submit" className="glass-btn px-6 py-2.5 text-sm">
        Load
      </button>
    </form>
  );
}
