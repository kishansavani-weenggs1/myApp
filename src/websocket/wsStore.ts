import type { WebSocket } from "ws";

const userSockets = new Map<number, Set<WebSocket>>();
const socketUser = new WeakMap<WebSocket, number>();

const groups = new Map<string, Set<WebSocket>>();
const socketGroups = new WeakMap<WebSocket, Set<string>>();

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

export function joinGroup(ws: WebSocket, group: string): void {
  if (!groups.has(group)) {
    groups.set(group, new Set());
  }

  groups.get(group)!.add(ws);

  if (!socketGroups.has(ws)) {
    socketGroups.set(ws, new Set());
  }

  socketGroups.get(ws)!.add(group);
}

export function leaveAllGroups(ws: WebSocket): void {
  const wsGroups = socketGroups.get(ws);
  if (!wsGroups) return;

  for (const group of wsGroups) {
    const sockets = groups.get(group);
    sockets?.delete(ws);

    if (sockets?.size === 0) {
      groups.delete(group);
    }
  }

  socketGroups.delete(ws);
}

export function sendToGroup(groupId: number, payload: unknown): void {
  const sockets = groups.get(`group:${groupId}`);
  if (!sockets) return;

  const message = JSON.stringify(payload);

  for (const ws of sockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }
}
