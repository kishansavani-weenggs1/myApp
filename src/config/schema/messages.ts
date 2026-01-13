import { z } from "../../swagger/zod.js";

export const createMessageSchema = z.object({
  body: z.object({
    message: z.string().openapi({ example: "Some message" }),
    toUserId: z.int().positive().openapi({ example: 1234 }),
  }),
});

export const editMessageSchema = z.object({
  body: z.object({
    message: z.string().openapi({ example: "Some message" }),
  }),
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const getGroupMessagesSchema = z.object({
  params: z.object({
    groupId: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const createGroupMessageSchema = z.object({
  body: z.object({
    message: z.string().openapi({ example: "Some message" }),
    groupId: z.int().positive().openapi({ example: 1234 }),
  }),
});

export const editGroupMessageSchema = z.object({
  body: z.object({
    message: z.string().openapi({ example: "Some message" }),
    groupId: z.int().positive().openapi({ example: 1234 }),
  }),
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});
