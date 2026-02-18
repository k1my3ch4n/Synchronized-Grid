"use client";

import { useRoomStore } from "../model/store";

export function RemoteCursors() {
  const { users, currentUser } = useRoomStore();

  const remoteUsers = users.filter((u) => u.id !== currentUser?.id && u.cursor);

  return (
    <>
      {remoteUsers.map((user) => (
        <div
          key={user.id}
          className="absolute pointer-events-none z-[9999]"
          style={{
            left: user.cursor!.x,
            top: user.cursor!.y,
          }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path
              d="M0 0L16 12H6L0 20V0Z"
              fill={user.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <span
            className="text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap ml-3"
            style={{ backgroundColor: user.color }}
          >
            {user.name}
          </span>
        </div>
      ))}
    </>
  );
}
