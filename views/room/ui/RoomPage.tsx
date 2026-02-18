"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useUrlStore } from "@features/url-input";
import { useRoomStore, RoomContext } from "@features/room";
import { CanvasEditor } from "@widgets/canvas";
import { UrlInput } from "@features/url-input";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { url } = useUrlStore();
  const isConnected = useRoomStore((state) => state.isConnected);

  useEffect(() => {
    useRoomStore.getState().joinRoom(roomId);

    return () => {
      useRoomStore.getState().leaveRoom();
    };
  }, [roomId]);

  if (!isConnected) {
    return (
      <main className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">방에 접속 중...</p>
      </main>
    );
  }

  return (
    <RoomContext.Provider value={{ isInRoom: true, roomId }}>
      <main className="h-[calc(100vh-64px)] bg-gray-100">
        {!url ? (
          <div className="flex items-center justify-center h-[calc(100vh-64px)]">
            <UrlInput />
          </div>
        ) : (
          <CanvasEditor />
        )}
      </main>
    </RoomContext.Provider>
  );
}
