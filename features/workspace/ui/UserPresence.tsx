"use client";

import { useState } from "react";
import { useWorkspaceStore } from "../model/store";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import type { WorkspaceRole, WorkspaceUser } from "@shared/types";
import { toast } from "sonner";

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "소유자",
  EDITOR: "편집자",
  VIEWER: "뷰어",
};

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

interface UserRowProps {
  user: WorkspaceUser;
  isCurrentUser: boolean;
  isOwner: boolean;
  workspaceId: string | null;
}

function UserRow({ user, isCurrentUser, isOwner, workspaceId }: UserRowProps) {
  const [loading, setLoading] = useState(false);

  const canManage = isOwner && !isCurrentUser && user.role !== "OWNER";

  const handleRoleChange = async (newRole: WorkspaceRole) => {
    if (!workspaceId || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${user.userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (res.ok) {
        toast.success(
          `${user.name}의 역할이 ${ROLE_LABELS[newRole]}(으)로 변경되었습니다`,
        );
      } else {
        const data = await res.json();
        toast.error(data.error || "역할 변경 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async () => {
    if (!workspaceId || loading) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members/${user.userId}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        toast.success(`${user.name}을(를) 추방했습니다`);
      } else {
        const data = await res.json();
        toast.error(data.error || "추방 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: user.color }}
        />
        <span className="text-xs text-text-primary truncate">
          {user.name}
          {isCurrentUser && <span className="text-text-muted ml-1">(나)</span>}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {canManage ? (
          <>
            <select
              value={user.role}
              onChange={(e) =>
                handleRoleChange(e.target.value as WorkspaceRole)
              }
              disabled={loading}
              className="text-[10px] bg-transparent text-text-muted border border-glass-border rounded px-1 py-0.5 cursor-pointer disabled:opacity-50"
            >
              <option value="EDITOR">편집자</option>
              <option value="VIEWER">뷰어</option>
            </select>
            <button
              onClick={handleKick}
              disabled={loading}
              className="text-[10px] text-red-400 hover:text-red-300 disabled:opacity-50"
              title="추방"
            >
              ✕
            </button>
          </>
        ) : (
          <span className="text-[10px] text-text-muted">
            {ROLE_LABELS[user.role]}
          </span>
        )}
      </div>
    </div>
  );
}
