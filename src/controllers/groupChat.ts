import { RequestHandler } from "express";
import { MESSAGE, REDIS, SOCKET_EVENT, UserRole } from "../config/constants.js";
import { HTTP_STATUS } from "../config/constants.js";
import { db } from "../db/index.js";
import {
  chatGroups,
  groupMembers,
  groupMessages,
  users,
} from "../db/schema.js";
import { and, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import {
  insertChatGroupSchema,
  insertGroupMemberSchema,
  insertGroupMessageSchema,
  updateChatGroupSchema,
  updateGroupMemberSchema,
  updateGroupMessageSchema,
} from "../db/validate-schema.js";
import {
  UserAttributes,
  GroupMemberCreationAttributes,
} from "../types/models.js";
import {
  AddOrRemoveUserInGroupBody,
  CreateGroupBody,
  CreateGroupMessageBody,
  EditGroupBody,
  EditGroupMessageBody,
} from "../types/zod.js";
import { sendToGroup } from "../websocket/wsStore.js";
import { softDeleteSchema } from "../config/schema/common.js";
import { redis } from "../config/redis.js";

export const getGroups: RequestHandler = async (req, res, next) => {
  try {
    const cachedGroups = await redis.get(REDIS.CACHE_KEY.GROUPS);

    if (cachedGroups) {
      const response = JSON.parse(cachedGroups);
      return res.status(HTTP_STATUS.OK).json({ response });
    } else {
      const groups = await db
        .select({
          groupName: chatGroups.groupName,
          groupAdmin: users.name,
          groupMembers: sql<string[]>`
                      COALESCE(
                        JSON_ARRAYAGG(${groupMembers.id}),
                        JSON_ARRAY()
                      )`,
        })
        .from(chatGroups)
        .innerJoin(
          users,
          and(eq(chatGroups.groupAdminId, users.id), isNull(users.deletedAt))
        )
        .innerJoin(
          groupMembers,
          and(
            eq(groupMembers.groupId, chatGroups.id),
            isNull(groupMembers.deletedAt)
          )
        )
        .where(isNull(chatGroups.deletedAt))
        .groupBy(chatGroups.id, chatGroups.groupName, users.name);

      await redis.setEx(
        REDIS.CACHE_KEY.GROUPS,
        REDIS.DATA_EXPIRY_TIME,
        JSON.stringify(groups)
      );

      return res.status(HTTP_STATUS.OK).json({ groups });
    }
  } catch (error) {
    next(error);
  }
};

export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const { groupName, members }: CreateGroupBody = req.body;
    const { id: userId } = req.user as UserAttributes;

    const membersArr = members.filter((id) => id !== userId);

    const [{ total }] = await db
      .select({
        total: sql<number>`count(*)`,
      })
      .from(users)
      .where(and(inArray(users.id, membersArr), isNull(users.deletedAt)));

    if (total !== membersArr.length) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("User"),
      });
    }

    const insertGroupData = insertChatGroupSchema.parse({
      groupName,
      groupAdminId: userId,
    });

    await db.transaction(async (tx) => {
      const [{ id: insertId }] = await tx
        .insert(chatGroups)
        .values(insertGroupData)
        .$returningId();

      const groupAdminRecord = insertGroupMemberSchema.parse({
        groupId: insertId,
        userId,
        isAdmin: true,
        createdId: userId,
      });

      const groupMembersInsertData: GroupMemberCreationAttributes[] = [
        groupAdminRecord,
      ];
      for (const member of membersArr) {
        const insertMember = insertGroupMemberSchema.parse({
          groupId: insertId,
          userId: member,
          isAdmin: false,
          createdId: userId,
        });
        groupMembersInsertData.push(insertMember);
      }

      await tx.insert(groupMembers).values(groupMembersInsertData);
    });

    await redis.del(REDIS.CACHE_KEY.GROUPS);

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.CREATED("Group"),
    });
  } catch (error) {
    next(error);
  }
};

export const editGroup: RequestHandler = async (req, res, next) => {
  try {
    const { groupName }: EditGroupBody = req.body;
    const id = Number(req.params?.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [groupInfo] = await db
      .select({
        id: chatGroups.id,
        groupAdminId: chatGroups.groupAdminId,
      })
      .from(chatGroups)
      .where(and(eq(chatGroups.id, id), isNull(chatGroups.deletedAt)))
      .limit(1);

    if (!groupInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Group") });

    if (groupInfo?.groupAdminId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateChatGroupSchema.parse({
      groupName,
      updatedId: userId,
    });

    await db.update(chatGroups).set(updateData).where(eq(chatGroups.id, id));

    await redis.del(REDIS.CACHE_KEY.GROUPS);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.UPDATED("Group"),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [groupInfo] = await db
      .select({
        id: chatGroups.id,
        groupAdminId: chatGroups.groupAdminId,
      })
      .from(chatGroups)
      .where(and(eq(chatGroups.id, id), isNull(chatGroups.deletedAt)))
      .limit(1);

    if (!groupInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Group") });

    if (groupInfo?.groupAdminId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    await db.transaction(async (tx) => {
      const deleteData = softDeleteSchema.parse({
        deletedId: userId,
        deletedAt: new Date(),
      });

      await tx
        .update(chatGroups)
        .set(deleteData)
        .where(and(eq(chatGroups.id, id), isNull(chatGroups.deletedAt)));

      await tx
        .update(groupMembers)
        .set(deleteData)
        .where(
          and(eq(groupMembers.groupId, id), isNull(groupMembers.deletedAt))
        );

      await tx
        .update(groupMessages)
        .set(deleteData)
        .where(
          and(eq(groupMessages.groupId, id), isNull(groupMessages.deletedAt))
        );
    });

    await redis.del(REDIS.CACHE_KEY.GROUPS);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.DELETED("Group"),
    });
  } catch (error) {
    next(error);
  }
};

export const addUserToGroup: RequestHandler = async (req, res, next) => {
  try {
    const { userId, groupId }: AddOrRemoveUserInGroupBody = req.body;
    const { id: currentUserId } = req.user as UserAttributes;

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)));

    if (!user)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("User"),
      });

    const groupMemberId = await getGroupMemberId(userId, groupId);
    if (groupMemberId)
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "User is already a member of this group",
      });

    const insertData = insertGroupMemberSchema.parse({
      userId,
      groupId,
      createdId: currentUserId,
    });

    await db.insert(groupMembers).values(insertData);

    await redis.del(REDIS.CACHE_KEY.GROUPS);

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.ADDED("User"),
    });
  } catch (error) {
    next(error);
  }
};

export const removeUserFromGroup: RequestHandler = async (req, res, next) => {
  try {
    const { userId, groupId }: AddOrRemoveUserInGroupBody = req.body;
    const { id: currentUserId, role } = req.user as UserAttributes;

    const [groupMemberInfo] = await db
      .select({
        groupMemberId: groupMembers.id,
        groupAdminId: chatGroups.groupAdminId,
      })
      .from(groupMembers)
      .innerJoin(
        chatGroups,
        and(
          eq(groupMembers.groupId, chatGroups.id),
          isNull(chatGroups.deletedAt)
        )
      )
      .where(
        and(
          eq(groupMembers.userId, userId),
          eq(groupMembers.groupId, groupId),
          isNull(groupMembers.deletedAt)
        )
      )
      .limit(1);

    if (!groupMemberInfo)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("User"),
      });

    if (
      groupMemberInfo?.groupAdminId !== currentUserId &&
      role !== UserRole.ADMIN
    )
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateGroupMemberSchema.parse({
      deletedId: currentUserId,
      deletedAt: new Date(),
    });

    await db
      .update(groupMembers)
      .set(updateData)
      .where(eq(groupMembers.id, groupMemberInfo.groupMemberId));

    await redis.del(REDIS.CACHE_KEY.GROUPS);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.REMOVED("User"),
    });
  } catch (error) {
    next(error);
  }
};

export const getGroupMessages: RequestHandler = async (req, res, next) => {
  try {
    const groupId = Number(req.params?.groupId);
    const { id: userId } = req.user as UserAttributes;

    const chatGroupId = await checkGroupExists(groupId);

    if (!chatGroupId)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("Group"),
      });

    const cachedMessages = await redis.get(
      `${REDIS.CACHE_KEY.GROUP_MESSAGES}-${groupId}`
    );

    if (cachedMessages) {
      const response = JSON.parse(cachedMessages);
      return res.status(HTTP_STATUS.OK).json({ response });
    } else {
      const receivedMessages = await db
        .select({
          message: groupMessages.message,
          status: groupMessages.status,
          fromUserId: users.id,
          fromUserName: users.name,
        })
        .from(groupMessages)
        .innerJoin(
          users,
          and(eq(groupMessages.fromUserId, users.id), isNull(users.deletedAt))
        )
        .where(
          and(
            eq(groupMessages.groupId, groupId),
            isNull(groupMessages.deletedAt),
            exists(
              db
                .select({ id: groupMembers.id })
                .from(groupMembers)
                .where(
                  and(
                    eq(groupMembers.groupId, groupMessages.groupId),
                    eq(groupMembers.userId, userId),
                    isNull(groupMembers.deletedAt)
                  )
                )
            )
          )
        );

      await redis.setEx(
        `${REDIS.CACHE_KEY.GROUP_MESSAGES}-${groupId}`,
        REDIS.DATA_EXPIRY_TIME,
        JSON.stringify(receivedMessages)
      );

      return res.status(HTTP_STATUS.OK).json({ receivedMessages });
    }
  } catch (error) {
    next(error);
  }
};

export const createGroupMessage: RequestHandler = async (req, res, next) => {
  try {
    const { message, groupId }: CreateGroupMessageBody = req.body;
    const { id: userId } = req.user as UserAttributes;

    const chatGroupId = await checkGroupExists(groupId);

    if (!chatGroupId)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("Group"),
      });

    const groupMemberId = await getGroupMemberId(userId, groupId);
    if (!groupMemberId)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const insertData = insertGroupMessageSchema.parse({
      message,
      groupId,
      fromUserId: userId,
    });

    const [{ id: insertId }] = await db
      .insert(groupMessages)
      .values(insertData)
      .$returningId();

    sendToGroup(groupId, {
      event: SOCKET_EVENT.MESSAGE.CREATED,
      data: {
        fromUserId: userId,
        message,
        sentAt: new Date(),
      },
    });

    await redis.del(`${REDIS.CACHE_KEY.GROUP_MESSAGES}-${groupId}`);

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.CREATED("Message"),
      id: insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const editGroupMessage: RequestHandler = async (req, res, next) => {
  try {
    const { message, groupId }: EditGroupMessageBody = req.body;
    const id = Number(req.params?.id);
    const { id: userId } = req.user as UserAttributes;

    const chatGroupId = await checkGroupExists(groupId);

    if (!chatGroupId)
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MESSAGE.NOT_EXISTS("Group"),
      });

    const groupMemberId = await getGroupMemberId(userId, groupId);
    if (!groupMemberId)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const [messageInfo] = await db
      .select({
        id: groupMessages.id,
        fromUserId: groupMessages.fromUserId,
      })
      .from(groupMessages)
      .where(
        and(
          eq(groupMessages.id, id),
          eq(groupMessages.groupId, groupId),
          isNull(groupMessages.deletedAt)
        )
      )
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Message") });

    if (messageInfo?.fromUserId !== userId)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateGroupMessageSchema.parse({
      message,
      updatedId: userId,
    });

    await db
      .update(groupMessages)
      .set(updateData)
      .where(eq(groupMessages.id, id));

    sendToGroup(groupId, {
      event: SOCKET_EVENT.MESSAGE.UPDATED,
      data: {
        fromUserId: userId,
        message,
        sentAt: new Date(),
      },
    });

    await redis.del(`${REDIS.CACHE_KEY.GROUP_MESSAGES}-${groupId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.UPDATED("Message"),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGroupMessage: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [messageInfo] = await db
      .select({
        id: groupMessages.id,
        fromUserId: groupMessages.fromUserId,
        groupId: groupMessages.groupId,
      })
      .from(groupMessages)
      .where(and(eq(groupMessages.id, id), isNull(groupMessages.deletedAt)))
      .limit(1);

    if (!messageInfo)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Message") });

    if (messageInfo?.fromUserId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updateGroupMessageSchema.parse({
      deletedId: userId,
      deletedAt: new Date(),
    });

    await db
      .update(groupMessages)
      .set(updateData)
      .where(eq(groupMessages.id, id));

    sendToGroup(messageInfo.groupId, {
      event: SOCKET_EVENT.MESSAGE.DELETED,
      data: {
        fromUserId: userId,
        sentAt: new Date(),
      },
    });

    await redis.del(`${REDIS.CACHE_KEY.GROUP_MESSAGES}-${messageInfo.groupId}`);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.DELETED("Message"),
    });
  } catch (error) {
    next(error);
  }
};

const getGroupMemberId = async (userId: number, groupId: number) => {
  const [groupMemberId] = await db
    .select({ id: groupMembers.id })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, groupId),
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
    )
    .limit(1);

  return groupMemberId;
};

const checkGroupExists = async (groupId: number) => {
  const [chatGroupId] = await db
    .select({ id: chatGroups.id })
    .from(chatGroups)
    .where(and(eq(chatGroups.id, groupId), isNull(chatGroups.deletedAt)))
    .limit(1);

  return chatGroupId;
};
