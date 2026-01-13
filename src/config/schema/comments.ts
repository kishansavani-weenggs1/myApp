import { z } from "../../swagger/zod.js";

export const getCommentsSchema = z.object({
  query: z.object({
    postId: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().openapi({ example: "This is a comment" }),
    postId: z.int().positive().openapi({ example: 1234 }),
  }),
});

export const editCommentSchema = z.object({
  body: z.object({
    content: z.string().openapi({ example: "This is an updated comment" }),
    postId: z.int().positive().openapi({ example: 1234 }),
  }),
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});
