"use client";

import { useRoomStore } from "../model/store";

export function UserPresence() {
  const { users, currentUser } = useRoomStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-center">
      {users.map((user) => (
        <div
          key={user.id}
          title={user.name}
          className="w-[30px] h-[30px] -ml-1.5 first:ml-0 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-background"
          style={{
            background: `linear-gradient(135deg, ${user.color}, ${user.color}dd)`,
          }}
        >
          {user.name[0]}
        </div>
      ))}
    </div>
  );
}
