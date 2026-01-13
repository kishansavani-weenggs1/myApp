import { RequestHandler } from "express";
import {
  MESSAGE,
  MessageStatus,
  REDIS,
  SOCKET_EVENT,
  UserRole,
} from "../config/constants.js";
import { HTTP_STATUS } from "../config/constants.js";
import { db } from "../db/index.js";
import { messages, users } from "../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import {
  insertMessageSchema,
  updateMessageSchema,
} from "../db/validate-schema.js";
import { UserAttributes } from "../types/models.js";
import { isUserOnline, sendToUser } from "../websocket/wsStore.js";
import { CreateMessageBody, EditMessageBody } from "../types/zod.js";
import { redis } from "../config/redis.js";

export const getMessages: RequestHandler = async (req, res, next) => {
  try {
    const { id: userId } = req.user as UserAttributes;

    const cachedMessages = await redis.get(
      `${REDIS.CACHE_KEY.MESSAGES}-${userId}`
    );

    if (cachedMessages) {
      const response = JSON.parse(cachedMessages);
      return res.status(HTTP_STATUS.OK).json({ response });
    } else {
      const receivedMessages = await db
        .select({
          message: messages.message,
          status: messages.status,
          fromUserId: users.id,
          fromUserName: users.name,
        })
        .from(messages)
        .innerJoin(
          users,
          and(eq(messages.fromUserId, users.id), isNull(users.deletedAt))
        )
        .where(and(eq(messages.toUserId, userId), isNull(messages.deletedAt)));

      await markDelivered(userId);

      await redis.setEx(
        `${REDIS.CACHE_KEY.MESSAGES}-${userId}`,
        REDIS.DATA_EXPIRY_TIME,
        JSON.stringify(receivedMessages)
      );

      return res.status(HTTP_STATUS.OK).json({ receivedMessages });
    }
  } catch (error) {
    next(error);
  }
};

export const createMessage: RequestHandler = async (req, res, next) => {
  try {
    const { message, toUserId }: CreateMessageBody = req.body;
    const { id: userId } = req.user as UserAttributes;

    const [userInfo] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, toUserId), isNull(users.deletedAt)))
      .limit(1);

    if (!userInfo)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("User"),
      });

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

    await redis.del(`${REDIS.CACHE_KEY.MESSAGES}-${toUserId}`);

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.CREATED("Message"),
      id: insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const editMessage: RequestHandler = async (req, res, next) => {
  try {
    const { message }: EditMessageBody = req.body;
    const id = Number(req.params?.id);
    const { id: userId } = req.user as UserAttributes;

    const [messageInfo] = await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
      })
      .from(messages)
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Message") });

    if (messageInfo?.fromUserId !== userId)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateMessageSchema.parse({
      message,
      updatedId: userId,
    });

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

    await redis.del(`${REDIS.CACHE_KEY.MESSAGES}-${messageInfo.toUserId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.UPDATED("Message"),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [messageInfo] = await db
      .select({
        id: messages.id,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
      })
      .from(messages)
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)))
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Message") });

    if (messageInfo?.fromUserId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateMessageSchema.parse({
      deletedId: userId,
      deletedAt: new Date(),
    });

    await db.update(messages).set(updateData).where(eq(messages.id, id));

    if (isUserOnline(messageInfo.toUserId)) {
      sendToUser(messageInfo.toUserId, {
        event: SOCKET_EVENT.MESSAGE.DELETED,
        data: {
          fromUserId: userId,
          sentAt: new Date(),
        },
      });
    }

    await redis.del(`${REDIS.CACHE_KEY.MESSAGES}-${messageInfo.toUserId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.DELETED("Message"),
    });
  } catch (error) {
    next(error);
  }
};

const markDelivered = async (userId: number) => {
  const updateData = updateMessageSchema.parse({
    status: MessageStatus.DELIVERED,
  });

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
