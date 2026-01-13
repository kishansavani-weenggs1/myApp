import { RequestHandler } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { posts } from "../db/schema.js";
import { HTTP_STATUS, MESSAGE } from "../config/constants.js";

export const validatePostExists: RequestHandler = async (req, res, next) => {
  try {
    const postId = Number(req.params.postId);

    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, postId), isNull(posts.deletedAt)))
      .limit(1);

    if (!post) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: MESSAGE.NOT_EXISTS("Post") });
    }

    next();
  } catch (error) {
    next(error);
  }
};
