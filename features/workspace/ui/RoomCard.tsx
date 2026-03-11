"use client";

import type { RoomResponse } from "@shared/types";

interface RoomCardProps {
  room: RoomResponse;
  onClick: () => void;
  onDelete?: () => void;
}

export function RoomCard({ room, onClick, onDelete }: RoomCardProps) {
  const createdDate = new Date(room.createdAt).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });

  return (
    <li
      onClick={onClick}
      className="glass-surface rounded-glass p-4 cursor-pointer flex justify-between items-center transition-all hover:bg-glass-hover hover:border-glass-glow hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border-l-2 border-l-accent/40 hover:border-l-accent"
    >
      <div className="flex flex-col gap-1">
        <span className="font-medium text-sm text-text-primary">
          {room.name}
        </span>
        <span className="text-xs text-text-muted">{createdDate}</span>
      </div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-xs text-text-muted hover:text-red-400 transition-colors px-2 py-1"
        >
          삭제
        </button>
      )}
    </li>
  );
}
