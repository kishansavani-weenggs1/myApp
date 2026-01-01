import { WebSocket } from "ws";
import { getWss } from "./index.js";

export function broadcast(payload: object): void {
  const wss = getWss();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}
