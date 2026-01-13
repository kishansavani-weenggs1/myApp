import { z } from "../../swagger/zod.js";

export const createGroupSchema = z.object({
  body: z.object({
    groupName: z.string().openapi({ example: "Your group" }),
    members: z
      .array(z.number().positive())
      .nonempty()
      .openapi({ example: [1, 2, 3, 4, 5, 6] }),
  }),
});

export const editGroupSchema = z.object({
  body: z.object({
    groupName: z.string().openapi({ example: "Your group" }),
  }),
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const addOrRemoveUserInGroupSchema = z.object({
  body: z.object({
    userId: z.int().positive().openapi({ example: 1234 }),
    groupId: z.int().positive().openapi({ example: 1234 }),
  }),
});
