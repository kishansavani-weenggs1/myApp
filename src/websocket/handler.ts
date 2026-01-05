import type { IncomingMessage } from "http";
import type { RawData, WebSocket } from "ws";

import { verifyWsToken } from "./auth.js";
import { rawDataToString } from "../utils/common.js";
import { MessageSchema, WsMessage } from "../types/websocket.js";
import {
  joinGroup,
  leaveAllGroups,
  registerSocket,
  unregisterSocket,
} from "./wsStore.js";
import { db } from "../db/index.js";
import { chatGroups, groupMembers } from "../db/schema.js";
import { and, eq, exists, isNull } from "drizzle-orm";

export async function handleConnection(ws: WebSocket, req: IncomingMessage) {
  if (!req.url || !req.headers.host) {
    ws.close();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    ws.close(1008, "Unauthorized");
    return;
  }

  const payload = verifyWsToken(token);
  const userId = payload.id;

  registerSocket(userId, ws);

  const groupIds = await db
    .select({
      groupId: groupMembers.groupId,
    })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.userId, userId),
        isNull(groupMembers.deletedAt),
        exists(
          db
            .select({ id: chatGroups.id })
            .from(chatGroups)
            .where(
              and(
                eq(chatGroups.id, groupMembers.groupId),
                isNull(chatGroups.deletedAt)
              )
            )
        )
      )
    );

  for (const { groupId } of groupIds) {
    joinGroup(ws, `group:${groupId}`);
    console.log(`User with id ${userId} has joined group with id ${groupId}`);
  }

  ws.on("message", (data: RawData) => {
    const text = rawDataToString(data);
    const message = JSON.parse(text) as WsMessage<MessageSchema>;

    if (message.event === "PING") {
      ws.send(
        JSON.stringify({
          event: "PONG",
          data: null,
        })
      );
      return;
    }
  });

  ws.on("close", () => {
    unregisterSocket(ws);
    leaveAllGroups(ws);
    console.log("WS disconnected:", userId);
  });
}
