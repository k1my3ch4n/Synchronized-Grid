"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { connectSocket, disconnectSocket } from "@shared/lib/socket";
import { useCanvasStore } from "@features/canvas";
import { useUrlStore } from "@features/url-input";
import { CanvasEditor } from "@widgets/canvas";
import { UrlInput } from "@features/url-input";

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { url } = useUrlStore();
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = connectSocket();

    socket.emit("room:join", { roomId }, (result: any) => {
      if (result.error) {
        setError(result.error);
        return;
      }

      // 서버 상태로 Canvas Store 초기화
      useCanvasStore.setState({ viewport: result.state.viewports });

      if (result.state.url) {
        useUrlStore.getState().setUrl(result.state.url);
      }

      setIsJoined(true);
    });

    return () => {
      disconnectSocket();
    };
  }, [roomId]);

  if (error) {
    return (
      <main className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
        <div className="win98-raised p-6 text-center">
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="win98-btn px-4 py-2 text-sm font-bold"
          >
            로비로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  if (!isJoined) {
    return (
      <main className="h-[calc(100vh-64px)] bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">방에 접속 중...</p>
      </main>
    );
  }

  return (
    <main className="h-[calc(100vh-64px)] bg-gray-100">
      {!url ? (
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <UrlInput />
        </div>
      ) : (
        <CanvasEditor />
      )}
    </main>
  );
}
