"use client";

import { createContext, useContext } from "react";

interface RoomContextType {
  isInRoom: boolean;
  roomId: string | null;
}

export const RoomContext = createContext<RoomContextType>({
  isInRoom: false,
  roomId: null,
});

export function useRoomContext() {
  return useContext(RoomContext);
}
