import type { WebSocket } from "ws";

const userSockets = new Map<number, Set<WebSocket>>();
const socketUser = new WeakMap<WebSocket, number>();

export function registerSocket(userId: number, socket: WebSocket): void {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  userSockets.get(userId)!.add(socket);
  socketUser.set(socket, userId);
}

export function unregisterSocket(socket: WebSocket): void {
  const userId = socketUser.get(socket);
  if (!userId) return;

  const sockets = userSockets.get(userId);
  sockets?.delete(socket);

  if (sockets?.size === 0) {
    userSockets.delete(userId);
  }

  socketUser.delete(socket);
}

export function sendToUser(userId: number, payload: unknown): void {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  const message = JSON.stringify(payload);

  sockets.forEach((socket) => {
    if (socket.readyState === socket.OPEN) {
      socket.send(message);
    }
  });
}

export function isUserOnline(userId: number): boolean {
  return userSockets.has(userId);
}
