"use client";

import {
  usePresetStore,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  groupPresetsByCategory,
} from "@entities/viewport";
import { useScrollSyncStore } from "@features/scroll-sync";
import { PaletteGroup } from "./PaletteGroup";
import { PaletteAddForm } from "./PaletteAddForm";

export function Palette() {
  const { presets, resetPresets } = usePresetStore();
  const { enabled, toggle } = useScrollSyncStore();
  const grouped = groupPresetsByCategory(presets);

  return (
    <aside className="w-[260px] glass border-r border-glass-border p-4 flex flex-col gap-2">
      <h2 className="text-label font-medium text-text-muted uppercase tracking-[3px] pb-3 border-b border-glass-border mb-1">
        Viewports
      </h2>
      {presets.length === 0 ? (
        <p className="text-xs text-text-muted text-center py-4">
          아래에서 뷰포트를 추가하세요
        </p>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto flex-1">
          {CATEGORY_ORDER.map((cat) => (
            <PaletteGroup
              key={cat}
              label={CATEGORY_LABELS[cat]}
              presets={grouped[cat]}
              defaultOpen={cat !== "custom"}
            />
          ))}
        </div>
      )}
      <PaletteAddForm />

      <button
        onClick={resetPresets}
        className="w-full p-2 text-xs text-text-muted hover:text-gd-rose transition-colors cursor-pointer"
      >
        기본 프리셋으로 초기화
      </button>

      <div className="mt-auto pt-3 border-t border-glass-border">
        <button
          onClick={toggle}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-glass text-label transition-colors cursor-pointer ${
            enabled
              ? "bg-accent/20 text-accent border border-accent/30"
              : "bg-white/[0.03] text-text-muted border border-glass-border hover:bg-white/[0.06]"
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20V4M12 4l-4 4M12 4l4 4M6 16h12" />
          </svg>
          <span>스크롤 동기화 {enabled ? "ON" : "OFF"}</span>
        </button>
      </div>
    </aside>
  );
}
