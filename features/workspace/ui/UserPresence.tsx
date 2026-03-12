"use client";

import { useWorkspaceStore } from "../model/store";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { UserRow } from "./UserRow";

export function UserPresence() {
  const { users, currentUser } = useWorkspaceStore();
  const { workspaceId } = useWorkspaceContext();
  const isOwner = currentUser?.role === "OWNER";

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
        <div className="glass rounded-lg py-2 px-1 min-w-[220px] shadow-lg">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser.id}
              isOwner={isOwner}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
