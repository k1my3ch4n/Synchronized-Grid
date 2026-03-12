"use client";

import { useWorkspaceStore } from "../model/store";

export function UserPresence() {
  const { users, currentUser } = useWorkspaceStore();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative group flex items-center">
      {users.map((user) => (
        <div
          key={user.id}
          className="w-[30px] h-[30px] -ml-1.5 first:ml-0 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-background"
          style={{
            background: `linear-gradient(135deg, ${user.color}, ${user.color}dd)`,
          }}
        >
          {user.name[0]}
        </div>
      ))}

      <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-50">
        <div className="glass rounded-lg py-2 px-1 min-w-[140px] shadow-lg">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-2 px-3 py-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-xs text-text-primary truncate">
                {user.name}
                {user.id === currentUser.id && (
                  <span className="text-text-muted ml-1">(나)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
