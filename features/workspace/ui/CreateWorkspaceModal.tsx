"use client";

import { useState } from "react";

interface CreateWorkspaceModalProps {
  onSubmit: (data: { name: string }) => Promise<void>;
  onClose: () => void;
}

export function CreateWorkspaceModal({
  onSubmit,
  onClose,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit({ name: name.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl w-[95%] max-w-[420px] overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-text-primary">
            워크스페이스 만들기
          </h2>
        </div>
        <div className="px-7 py-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="내 워크스페이스"
              maxLength={50}
              className="glass-input w-full px-4 py-3 text-sm rounded-glass"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="glass-surface flex-1 px-4 py-3 text-sm rounded-glass text-text-secondary hover:bg-glass-hover transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !name.trim()}
              className="glass-btn flex-1 px-4 py-3 text-sm disabled:opacity-50"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
