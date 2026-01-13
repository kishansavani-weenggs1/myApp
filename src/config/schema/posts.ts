import { z } from "../../swagger/zod.js";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().openapi({ example: "This is a post name" }),
    description: z.string().openapi({ example: "This is a post description" }),
  }),
});

export const editPostSchema = z.object({
  body: z.object({
    title: z.string().openapi({ example: "This is a post name" }),
    description: z.string().openapi({ example: "This is a post description" }),
  }),
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    search: z.string().optional().openapi({ example: 1234 }),
  }),
});
