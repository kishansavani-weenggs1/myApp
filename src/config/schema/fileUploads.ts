import { z } from "zod";

export const uploadFileSchema = z.object({
  params: z.object({
    postId: z.coerce.number().int().positive(),
  }),
});
