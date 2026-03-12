"use client";

import { useWorkspaceStore } from "../model/store";
import { getTextColorForBg } from "@shared/lib/color";

export function RemoteCursors() {
  const { users, currentUser } = useWorkspaceStore();

  const remoteUsers = users.filter((u) => u.id !== currentUser?.id && u.cursor);

  return (
    <>
      {remoteUsers.map((user) => (
        <div
          key={user.id}
          className="absolute pointer-events-none z-[9999] transition-[left,top] duration-150 ease-out"
          style={{
            left: user.cursor!.x,
            top: user.cursor!.y,
          }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M0 0L16 12H6L0 20V0Z"
              fill={user.color}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="1"
            />
          </svg>
          <span
            className="text-caption font-semibold px-2 py-0.5 rounded whitespace-nowrap ml-3"
            style={{
              backgroundColor: user.color,
              color: getTextColorForBg(user.color),
              boxShadow: `0 2px 8px ${user.color}66`,
            }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </>
  );
}
