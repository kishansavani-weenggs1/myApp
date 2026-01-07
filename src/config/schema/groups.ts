import { z } from "../../swagger/zod.js";

export const createGroupSchema = z.object({
  body: z.object({
    groupName: z.string(),
    members: z.array(z.number().positive()).nonempty(),
  }),
});

export const editGroupSchema = z.object({
  body: z.object({
    groupName: z.string(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const addOrRemoveUserInGroupSchema = z.object({
  body: z.object({
    userId: z.int().positive(),
    groupId: z.int().positive(),
  }),
});
