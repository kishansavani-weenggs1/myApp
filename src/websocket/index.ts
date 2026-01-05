import { Server as HttpServer } from "http";
import { WebSocketServer } from "ws";
import { handleConnection } from "./handler.js";

let wss: WebSocketServer;

export function initWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ server });
  wss.on("connection", (ws, req) => {
    void handleConnection(ws, req);
  });
}

export function getWss(): WebSocketServer {
  if (!wss) {
    throw new Error("WebSocket not initialized");
  }
  return wss;
}
