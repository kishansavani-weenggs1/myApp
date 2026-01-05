import { z } from "zod";

export const createMessageSchema = z.object({
  body: z.object({
    message: z.string(),
    toUserId: z.int().positive(),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const createGroupMessageSchema = z.object({
  body: z.object({
    message: z.string(),
    groupId: z.int().positive(),
  }),
});

export const editGroupMessageSchema = z.object({
  body: z.object({
    message: z.string(),
    groupId: z.int().positive(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
