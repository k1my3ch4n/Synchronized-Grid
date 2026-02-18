"use client";

import { useRoomStore } from "../model/store";

export function UserPresence() {
  const { users, currentUser } = useRoomStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {users.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
          style={{ backgroundColor: user.color }}
        >
          {user.name[0]}
        </div>
      ))}
    </div>
  );
}
