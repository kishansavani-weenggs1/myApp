import { NextFunction, Request, Response } from "express";
import { UserAttributes } from "../types/models/users.js";
import { MessageStatus, SOCKET_EVENT, UserRole } from "../config/constants.js";
import { HTTP_STATUS } from "../config/constants.js";
import { db } from "../db/index.js";
import { messages, users } from "../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import {
  insertMessageSchema,
  updateMessageSchema,
} from "../db/validate-schema.js";
import {
  MessageAttributes,
  OptionalMessageAttributes,
} from "../types/models/messages.js";
import { isUserOnline, sendToUser } from "../websocket/wsStore.js";

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: userId } = req.user as UserAttributes;

    const receivedMessages = await db
      .select({
        message: messages.message,
        status: messages.status,
        fromUserId: users.id,
        fromUserName: users.name,
      })
      .from(messages)
      .innerJoin(users, eq(messages.fromUserId, users.id))
      .where(and(eq(messages.toUserId, userId), isNull(messages.deletedAt)));

    await markDelivered(userId);

    res.status(HTTP_STATUS.OK).json({ receivedMessages });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message, toUserId }: MessageAttributes = req.body;
    const { id: userId } = req.user as UserAttributes;

    const insertData = insertMessageSchema.parse({
      message,
      toUserId,
      fromUserId: userId,
    });

    const [{ id: insertId }] = await db
      .insert(messages)
      .values(insertData)
      .$returningId();

    if (isUserOnline(toUserId)) {
      sendToUser(toUserId, {
        event: SOCKET_EVENT.MESSAGE.CREATED,
        data: {
          fromUserId: userId,
          message,
          sentAt: new Date(),
        },
      });

      await markDelivered(toUserId);
    }

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Message created successfully",
      id: insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { message }: MessageAttributes = req.body;
    const id = Number(req.params?.id);
    const { id: userId } = req.user as UserAttributes;

    const [messageInfo] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Message does not exists" });

    if (messageInfo?.fromUserId !== userId)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    const updateData = updateMessageSchema.parse({
      message,
      updatedId: userId,
    } as OptionalMessageAttributes);

    await db.update(messages).set(updateData).where(eq(messages.id, id));

    if (isUserOnline(messageInfo.toUserId)) {
      sendToUser(messageInfo.toUserId, {
        event: SOCKET_EVENT.MESSAGE.UPDATED,
        data: {
          fromUserId: userId,
          message,
          sentAt: new Date(),
        },
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      message: "Message updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [messageInfo] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Message does not exists" });

    if (messageInfo?.fromUserId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    const updateData = updateMessageSchema.parse({
      deletedId: userId,
      deletedAt: new Date(),
    } as OptionalMessageAttributes);

    await db.update(messages).set(updateData).where(eq(messages.id, id));

    if (isUserOnline(messageInfo.toUserId)) {
      sendToUser(messageInfo.toUserId, {
        event: SOCKET_EVENT.MESSAGE.DELETED,
        data: {
          fromUserId: userId,
          message: messageInfo.message,
          sentAt: new Date(),
        },
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      message: "Message Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const markDelivered = async (userId: number) => {
  const updateData = updateMessageSchema.parse({
    status: MessageStatus.DELIVERED,
  } as OptionalMessageAttributes);

  return await db
    .update(messages)
    .set(updateData)
    .where(
      and(
        eq(messages.toUserId, userId),
        eq(messages.status, MessageStatus.SENT)
      )
    );
};
