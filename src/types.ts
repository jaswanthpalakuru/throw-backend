import { Socket } from "socket.io";

export interface ThrowSocket extends Socket {
  roomId?: string
}