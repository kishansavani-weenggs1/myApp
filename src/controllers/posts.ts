import { NextFunction, Request, Response } from "express";
import { UserAttributes } from "../types/models/users.js";
import { REDIS, UserRole } from "../config/constants.js";
import { HTTP_STATUS, SOCKET_EVENT } from "../config/constants.js";
import { broadcast } from "../websocket/broadcast.js";
import { db } from "../db/index.js";
import { posts, users } from "../db/schema.js";
import { and, eq, isNull, like } from "drizzle-orm";
import {
  OptionalPostAttributes,
  PostAttributes,
  PostCreationAttributes,
} from "../types/models/posts.js";
import { insertPostSchema, updatePostSchema } from "../db/validate-schema.js";
import { redis } from "../config/redis.js";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search = "" } = req.query;
    let response = {};
    let cachedPosts: string | null = "";
    if (!search) {
      cachedPosts = await redis.get(REDIS.CACHE_KEY.POSTS);
    }
    if (cachedPosts) {
      response = JSON.parse(cachedPosts);
      res.status(HTTP_STATUS.OK).json({ response });
    } else {
      const postDetails = await db
        .select({
          title: posts.title,
          description: posts.description,
          isPublished: posts.isPublished,
          isActive: posts.isActive,
          userName: users.name,
        })
        .from(posts)
        .innerJoin(users, eq(posts.userId, users.id))
        .where(
          and(
            like(posts.title, `%${search as string}%`),
            isNull(posts.deletedAt)
          )
        );

      await redis.setEx(
        REDIS.CACHE_KEY.POSTS,
        REDIS.DATA_EXPIRY_TIME,
        JSON.stringify(postDetails)
      );

      res.status(HTTP_STATUS.OK).json({ postDetails });
    }
  } catch (error) {
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      description,
      imageId = null,
      videoId = null,
    }: PostAttributes = req.body;
    const userId = (req.user as UserAttributes)?.id;

    let insertData: PostCreationAttributes = {
      title,
      description,
      userId,
    };

    if (imageId) insertData.imageId = imageId;
    if (videoId) insertData.videoId = videoId;

    insertData = insertPostSchema.parse(insertData);

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

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Post created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const editPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description }: PostAttributes = req.body;
    const id = Number(req.params?.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);

    if (!post)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Post does not exists" });

    if (post?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    let updateData: OptionalPostAttributes = {
      title,
      description,
      updatedId: userId,
    };

    updateData = updatePostSchema.parse(updateData);

    await db.update(posts).set(updateData).where(eq(posts.id, id));

    broadcast({
      event: SOCKET_EVENT.POST.UPDATED,
      data: {
        id: post.id,
        title: post.title,
        userId: post.userId,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Post updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { id: userId, role } = req.user as UserAttributes;

    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);

    if (!post)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "Post does not exists" });

    if (post?.userId !== userId && role !== UserRole.ADMIN)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: "Invalid Request" });

    let updateData: OptionalPostAttributes = {
      isActive: false,
      deletedId: userId,
      deletedAt: new Date(),
    };

    updateData = updatePostSchema.parse(updateData);

    await db.update(posts).set(updateData).where(eq(posts.id, id));

    broadcast({
      event: SOCKET_EVENT.POST.DELETED,
      data: {
        id: post.id,
        title: post.title,
        userId: post.userId,
      },
    });

    return res.status(HTTP_STATUS.OK).json({
      message: "Post Deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
