import type { IncomingMessage } from "http";
import type { RawData, WebSocket } from "ws";

import { verifyWsToken } from "./auth.js";
import { rawDataToString } from "../utils/common.js";
import { MessageSchema, WsMessage } from "../types/websocket.js";
import { registerSocket, unregisterSocket } from "./wsStore.js";

export function handleConnection(
  socket: WebSocket,
  req: IncomingMessage
): void {
  if (!req.url || !req.headers.host) {
    socket.close();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    socket.close(1008, "Unauthorized");
    return;
  }

  const payload = verifyWsToken(token);
  const userId = payload.id;

  registerSocket(userId, socket);

  socket.on("message", (data: RawData) => {
    const text = rawDataToString(data);
    const message = JSON.parse(text) as WsMessage<MessageSchema>;

    if (message.event === "PING") {
      socket.send(
        JSON.stringify({
          event: "PONG",
          data: null,
        })
      );
      return;
    }

    // if (message.event === "CHAT") {
    //   const fromUserId = userId;

    //   sendToUser(message.data.toUserId, {
    //     event: "CHAT",
    //     data: {
    //       fromUserId,
    //       message: message.data.message,
    //       sentAt: new Date(),
    //     },
    //   });
    // }
  });

  socket.on("close", () => {
    unregisterSocket(socket);
    console.log("WS disconnected:", userId);
  });
}
