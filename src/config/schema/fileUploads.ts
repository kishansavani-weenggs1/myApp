import { z } from "../../swagger/zod.js";

export const uploadFileSchema = z.object({
  params: z.object({
    postId: z.coerce.number().int().positive(),
  }),
});
