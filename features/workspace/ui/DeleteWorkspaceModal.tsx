"use client";

import { useState } from "react";

interface DeleteWorkspaceModalProps {
  workspaceName: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function DeleteWorkspaceModal({
  workspaceName,
  onConfirm,
  onClose,
}: DeleteWorkspaceModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl w-[95%] max-w-[420px] overflow-hidden">
        <header className="px-7 pt-7 pb-5 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-text-primary">
            워크스페이스 삭제
          </h2>
        </header>
        <div className="px-7 py-6 space-y-4">
          <p className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              &apos;{workspaceName}&apos;
            </span>{" "}
            워크스페이스를 삭제하시겠습니까?
          </p>
          <p className="text-xs text-gd-rose">
            이 작업은 되돌릴 수 없으며, 모든 워크스페이스 데이터가 삭제됩니다.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="glass-surface flex-1 px-4 py-3 text-sm rounded-glass text-text-secondary hover:bg-glass-hover transition-colors"
            >
              취소
            </button>
            <button
              data-testid="delete-workspace-confirm"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 text-sm rounded-glass bg-gd-rose/20 text-gd-rose border border-gd-rose/30 hover:bg-gd-rose/30 transition-colors disabled:opacity-50"
            >
              {loading ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
