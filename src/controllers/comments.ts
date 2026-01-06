import { NextFunction, Request, Response } from "express";
import { UserRole } from "../config/constants.js";
import { HTTP_STATUS, SOCKET_EVENT } from "../config/constants.js";
import { broadcast } from "../websocket/broadcast.js";
import { db } from "../db/index.js";
import { comments, posts, users } from "../db/schema.js";
import { and, eq, isNull } from "drizzle-orm";
import { UserAttributes } from "../types/models.js";
import {
  insertCommentSchema,
  updateCommentSchema,
} from "../db/validate-schema.js";
import { CreateCommentBody, EditCommentBody } from "../types/zod.js";
import { softDeleteSchema } from "../config/schema/common.js";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = Number(req.query.postId);
    if (!postId)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: "Invalid Request" });

    const commentDetails = await db
      .select({
        content: comments.content,
        postTitle: posts.title,
        postDesc: posts.description,
        userName: users.name,
      })
      .from(comments)
      .innerJoin(
        posts,
        and(eq(comments.postId, posts.id), isNull(posts.deletedAt))
      )
      .innerJoin(
        users,
        and(eq(comments.userId, users.id), isNull(users.deletedAt))
      )
      .where(and(eq(comments.postId, postId), isNull(comments.deletedAt)));

    res.status(HTTP_STATUS.OK).json({ commentDetails });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, postId }: CreateCommentBody = req.body;
    const userId = req?.user ? (req.user as UserAttributes)?.id : null;

    const insertData = insertCommentSchema.parse({
      content,
      postId,
      userId,
    });

    const [{ id: insertId }] = await db
      .insert(comments)
      .values(insertData)
      .$returningId();

    broadcast({
      event: SOCKET_EVENT.COMMENT.CREATED,
      data: {
        id: insertId,
        content,
        postId,
        userId,
      },
    });

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Comment created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const editComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content, postId }: EditCommentBody = req.body;
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [comment] = await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.id, id),
          eq(comments.postId, postId),
          isNull(comments.deletedAt)
        )
      )
      .limit(1);

    if (!comment)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Comment does not exists" });

    if (comment?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    const updateData = updateCommentSchema.parse({
      content,
      updatedId: userId,
    });

    await db.update(comments).set(updateData).where(eq(comments.id, id));

    broadcast({
      event: SOCKET_EVENT.COMMENT.UPDATED,
      data: {
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        userId: comment.userId,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Comment updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, id), isNull(comments.deletedAt)));

    if (!comment)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Comment does not exists" });

    if (comment?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    const updateData = softDeleteSchema.parse({
      deletedId: userId,
      deletedAt: new Date(),
    });
    await db.update(comments).set(updateData).where(eq(comments.id, id));

    broadcast({
      event: SOCKET_EVENT.COMMENT.DELETED,
      data: {
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        userId: comment.userId,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Comment Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
