import { RequestHandler } from "express";
import { MESSAGE, REDIS, UserRole } from "../config/constants.js";
import { HTTP_STATUS, SOCKET_EVENT } from "../config/constants.js";
import { broadcast } from "../websocket/broadcast.js";
import { db } from "../db/index.js";
import { comments, fileUploads, posts, users } from "../db/schema.js";
import { and, eq, isNull, like, sql } from "drizzle-orm";
import { UserAttributes } from "../types/models.js";
import { insertPostSchema, updatePostSchema } from "../db/validate-schema.js";
import { redis } from "../config/redis.js";
import { CreatePostBody, EditPostBody } from "../types/zod.js";
import { softDeleteSchema } from "../config/schema/common.js";
import path from "path";
import fs from "fs/promises";

export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const { search = "" } = req.query;
    let cachedPosts: string | null = "";

    if (!search) {
      cachedPosts = await redis.get(REDIS.CACHE_KEY.POSTS);
    }

    if (cachedPosts) {
      const response = JSON.parse(cachedPosts);
      return res.status(HTTP_STATUS.OK).json({ response });
    } else {
      const postDetails = await db
        .select({
          title: posts.title,
          description: posts.description,
          isPublished: posts.isPublished,
          userName: users.name,
          files: sql<string[]>`
            COALESCE(
              JSON_ARRAYAGG(${fileUploads.url}),
              JSON_ARRAY()
            )`,
        })
        .from(posts)
        .innerJoin(
          users,
          and(eq(posts.userId, users.id), isNull(users.deletedAt))
        )
        .leftJoin(
          fileUploads,
          and(eq(posts.id, fileUploads.postId), isNull(fileUploads.deletedAt))
        )
        .where(
          and(
            like(posts.title, `%${search as string}%`),
            isNull(posts.deletedAt)
          )
        )
        .groupBy(
          posts.id,
          posts.title,
          posts.description,
          posts.isPublished,
          users.name
        );

      await redis.setEx(
        REDIS.CACHE_KEY.POSTS,
        REDIS.DATA_EXPIRY_TIME,
        JSON.stringify(postDetails)
      );

      return res.status(HTTP_STATUS.OK).json({ postDetails });
    }
  } catch (error) {
    next(error);
  }
};

export const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { title, description }: CreatePostBody = req.body;
    const userId = (req.user as UserAttributes)?.id;

    const insertData = insertPostSchema.parse({
      title,
      description,
      userId,
    });

    const [{ id: insertId }] = await db
      .insert(posts)
      .values(insertData)
      .$returningId();

    broadcast({
      event: SOCKET_EVENT.POST.CREATED,
      data: {
        id: insertId,
        title,
        userId,
      },
    });

    await redis.del(REDIS.CACHE_KEY.POSTS);

    return res.status(HTTP_STATUS.CREATED).json({
      message: MESSAGE.CREATED("Post"),
    });
  } catch (error) {
    next(error);
  }
};

export const editPost: RequestHandler = async (req, res, next) => {
  try {
    const { title, description }: EditPostBody = req.body;
    const id = Number(req.params?.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        userId: posts.userId,
      })
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);

    if (!post)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Post") });

    if (post?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    const updateData = updatePostSchema.parse({
      title,
      description,
      updatedId: userId,
    });

    await db.update(posts).set(updateData).where(eq(posts.id, id));

    broadcast({
      event: SOCKET_EVENT.POST.UPDATED,
      data: {
        id: post.id,
        title: post.title,
        userId: post.userId,
      },
    });

    await redis.del(REDIS.CACHE_KEY.POSTS);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.UPDATED("Post"),
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [post] = await db
      .select({
        id: posts.id,
        title: posts.title,
        userId: posts.userId,
      })
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);

    if (!post)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Post") });

    if (post?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: MESSAGE.UNAUTHORIZED });

    await db.transaction(async (tx) => {
      const deleteData = softDeleteSchema.parse({
        deletedId: userId,
        deletedAt: new Date(),
      });

      await tx
        .update(posts)
        .set(deleteData)
        .where(and(eq(posts.id, id), isNull(posts.deletedAt)));

      await tx
        .update(comments)
        .set(deleteData)
        .where(and(eq(comments.postId, id), isNull(comments.deletedAt)));

      const files = await tx
        .select({
          id: fileUploads.id,
          url: fileUploads.url,
        })
        .from(fileUploads)
        .where(and(eq(fileUploads.postId, id), isNull(fileUploads.deletedAt)));

      await Promise.all(
        files.map(async (file) => {
          const filePath = path.resolve("src/uploads", file.url);
          await fs.unlink(filePath).catch(() => null);
        })
      );

      await tx
        .update(fileUploads)
        .set(deleteData)
        .where(and(eq(fileUploads.postId, id), isNull(fileUploads.deletedAt)));
    });

    broadcast({
      event: SOCKET_EVENT.POST.DELETED,
      data: {
        id: post.id,
        title: post.title,
        userId: post.userId,
      },
    });

    await redis.del(REDIS.CACHE_KEY.POSTS);

    return res.status(HTTP_STATUS.OK).json({
      message: MESSAGE.DELETED("Post"),
    });
  } catch (error) {
    next(error);
  }
};
