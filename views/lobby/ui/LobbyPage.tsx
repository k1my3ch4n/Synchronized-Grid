"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { connectSocket, getSocket } from "@shared/lib/socket";
import { RoomInfo } from "@shared/types";

export function LobbyPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const socket = connectSocket();

    socket.emit("room:list", (roomList: RoomInfo[]) => {
      setRooms(roomList);
    });

    socket.on("room:created", (room: RoomInfo) => {
      setRooms((prev) => [...prev, room]);
    });

    socket.on("room:updated", (updated: RoomInfo) => {
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
    <main className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
      <div className="win98-raised p-6 w-[480px]">
        <h2 className="text-lg font-bold mb-4">방 만들기</h2>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
            placeholder="방 이름을 입력하세요"
            className="win98-sunken flex-1 px-3 py-2 text-sm"
          />
          <button
            onClick={handleCreateRoom}
            className="win98-btn px-4 py-2 text-sm font-bold"
          >
            생성
          </button>
        </div>

        <h2 className="text-lg font-bold mb-2">방 목록</h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            생성된 방이 없습니다
          </p>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li
                key={room.id}
                onClick={() => handleJoinRoom(room.id)}
                className="win98-btn p-3 cursor-pointer flex justify-between items-center"
              >
                <span className="font-bold text-sm">{room.name}</span>
                <span className="text-xs text-gray-600">
                  {room.userCount}명 접속 중
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
