import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const editPostSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const getPostsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
  }),
});
