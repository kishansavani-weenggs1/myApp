import { z } from "../../swagger/zod.js";

export const commonDeleteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive().openapi({ example: 1234 }),
  }),
});

export const softDeleteSchema = z.object({
  deletedId: z.number(),
  deletedAt: z.date(),
});
