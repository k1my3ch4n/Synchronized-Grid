"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@features/auth";
import { RoomCard, CreateRoomModal } from "@features/workspace";
import {
  fetchWorkspaceDetail,
  fetchWorkspaceRooms,
  createRoom,
  deleteRoom,
} from "@entities/workspace";
import type { RoomResponse } from "@shared/types";

interface WorkspaceDetailPageProps {
  workspaceId: string;
}

export function WorkspaceDetailPage({ workspaceId }: WorkspaceDetailPageProps) {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [detail, roomList] = await Promise.all([
        fetchWorkspaceDetail(workspaceId),
        fetchWorkspaceRooms(workspaceId),
      ]);
      setWorkspaceName(detail.name);
      setRooms(roomList);
    } catch {
      router.push("/workspaces");
    } finally {
      setLoading(false);
    }
  }, [workspaceId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRoom = async (data: { name: string }) => {
    await createRoom(workspaceId, data);
    setShowCreate(false);
    await loadData();
  };

  const handleDeleteRoom = async (roomId: string) => {
    await deleteRoom(workspaceId, roomId);
    await loadData();
  };

  return (
    <AuthGuard>
      <main className="page-height flex items-center justify-center">
        <div className="glass rounded-2xl w-[95%] max-w-[480px] overflow-hidden">
          <div className="px-7 pt-7 pb-5 border-b border-glass-border">
            <button
              onClick={() => router.push("/workspaces")}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors mb-2 flex items-center gap-1"
            >
              ← 워크스페이스 목록
            </button>
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">
                {loading ? "..." : workspaceName}
              </h2>
              <button
                onClick={() => setShowCreate(true)}
                className="glass-btn px-4 py-2 text-sm whitespace-nowrap"
              >
                + 새 룸
              </button>
            </div>
          </div>
          <div className="px-7 py-6">
            <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-3">
              룸 목록
            </h3>
            {loading ? (
              <p className="text-sm text-text-muted text-center py-6">
                불러오는 중...
              </p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                룸을 만들어 협업을 시작하세요
              </p>
            ) : (
              <ul className="space-y-2">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => router.push(`/room/${room.id}`)}
                    onDelete={() => handleDeleteRoom(room.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateRoomModal
          onSubmit={handleCreateRoom}
          onClose={() => setShowCreate(false)}
        />
      )}
    </AuthGuard>
  );
}
