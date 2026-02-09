"use client";

import { useState } from "react";
import { useUrlStore } from "../model/store";

export function UrlInput() {
  const { url, setUrl } = useUrlStore();
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
        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Load
      </button>
    </form>
  );
}
