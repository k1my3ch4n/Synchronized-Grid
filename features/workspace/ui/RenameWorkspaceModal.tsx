"use client";

import { useState } from "react";
import { WORKSPACE_NAME_MAX_LENGTH } from "@shared/constants";

interface RenameWorkspaceModalProps {
  currentName: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function RenameWorkspaceModal({
  currentName,
  onSubmit,
  onClose,
}: RenameWorkspaceModalProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = () => {
    const trimmed = name.trim();

    if (!trimmed || trimmed === currentName) {
      return;
    }

    onSubmit(trimmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl w-[95%] max-w-[420px] overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-text-primary">
            워크스페이스 이름 변경
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
              placeholder="워크스페이스 이름"
              maxLength={WORKSPACE_NAME_MAX_LENGTH}
              className="glass-input w-full px-4 py-3 text-sm rounded-glass"
              autoFocus
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="glass-surface flex-1 px-4 py-3 text-sm rounded-glass text-text-secondary hover:bg-glass-hover transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || name.trim() === currentName}
              className="glass-btn flex-1 px-4 py-3 text-sm disabled:opacity-50"
            >
              변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
