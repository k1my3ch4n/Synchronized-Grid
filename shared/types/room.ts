export interface RoomInfo {
  id: string;
  name: string;
  userCount: number;
  createdAt: Date;
}

export interface RoomUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}
