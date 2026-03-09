"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connectSocket, getSocket } from "@shared/lib/socket";
import { RoomInfo } from "@shared/types";

export function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Omit<RoomInfo, "createdAt">[]>([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const socket = connectSocket();

    socket.emit("room:list", (roomList) => {
      setRooms(roomList);
    });

    socket.on("room:created", (room) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on("room:updated", (updated) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
      );
    });

    socket.on("room:deleted", ({ roomId }: { roomId: string }) => {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    });

    return () => {
      socket.off("room:created");
      socket.off("room:updated");
      socket.off("room:deleted");
    };
  }, []);

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      return;
    }

    const socket = getSocket();

    socket.emit(
      "room:create",
      { name: roomName },
      ({ roomId }: { roomId: string }) => {
        router.push(`/room/${roomId}`);
      },
    );
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  return (
    <main className="page-height flex items-center justify-center">
      <div className="glass rounded-2xl w-[95%] max-w-[480px] overflow-hidden">
        <div className="px-7 pt-7 pb-5 border-b border-glass-border">
          <h2 className="text-lg font-semibold text-text-primary">새로운 방</h2>
          <p className="text-sm text-text-secondary mt-1">
            싱긋에서 협업 그리드를 만들고 참여하세요
          </p>
        </div>
        <div className="px-7 py-6">
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              placeholder="방 이름을 입력하세요"
              className="glass-input flex-1 px-4 py-3 text-sm rounded-glass"
            />
            <button
              onClick={handleCreateRoom}
              className="glass-btn px-6 py-3 text-sm whitespace-nowrap"
            >
              생성
            </button>
          </div>

          <h3 className="text-xs font-medium text-text-secondary uppercase tracking-widest mb-3">
            활성 방
          </h3>
          {rooms.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">
              생성된 방이 없습니다
            </p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  onClick={() => handleJoinRoom(room.id)}
                  className="glass-surface rounded-glass p-4 cursor-pointer flex justify-between items-center transition-all hover:bg-glass-hover hover:border-glass-glow hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] border-l-2 border-l-accent/40 hover:border-l-accent"
                >
                  <span className="font-medium text-sm text-text-primary">
                    {room.name}
                  </span>
                  <span className="text-xs text-gd-green flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gd-green rounded-full animate-[pulse-dot_2s_infinite]" />
                    {room.userCount}명 접속 중
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
