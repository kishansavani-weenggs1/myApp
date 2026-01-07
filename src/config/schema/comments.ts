import { z } from "../../swagger/zod.js";

export const getCommentsSchema = z.object({
  query: z.object({
    postId: z.coerce.number().int().positive(),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string(),
    postId: z.int().positive(),
  }),
});

export const editCommentSchema = z.object({
  body: z.object({
    content: z.string(),
    postId: z.int().positive(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
