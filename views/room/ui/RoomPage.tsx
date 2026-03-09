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
      <main className="page-height flex flex-col items-center justify-center gap-3">
        <div className="loading-spinner" />
        <p className="text-sm text-text-secondary">방에 접속 중...</p>
      </main>
    );
  }

  return (
    <RoomContext.Provider value={{ isInRoom: true, roomId }}>
      <main className="page-height">
        {!url ? (
          <div className="flex items-center justify-center page-height">
            <UrlInput />
          </div>
        ) : (
          <CanvasEditor />
        )}
      </main>
    </RoomContext.Provider>
  );
}
