"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@shared/lib/socket";
import { useRoomStore } from "../model/store";
import { toast } from "sonner";

export function ConnectionStatus() {
  const isConnected = useRoomStore((s) => s.isConnected);
  const [socketConnected, setSocketConnected] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    const socket = getSocket();

    const handleDisconnect = () => {
      setSocketConnected(false);
      toast.error("서버와의 연결이 끊어졌습니다. 재연결 중...");
    };

    const handleReconnect = () => {
      setSocketConnected(true);
      toast.success("서버에 다시 연결되었습니다");
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [isConnected]);

  if (!isConnected) {
    return null;
  }

  return (
    <div
      className={`w-2 h-2 rounded-full transition-colors ${
        socketConnected ? "bg-emerald-400" : "bg-red-400 animate-pulse"
      }`}
      title={socketConnected ? "연결됨" : "연결 끊김"}
    />
  );
}
