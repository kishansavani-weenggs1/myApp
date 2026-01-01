import { z } from "zod";

export const commonDeleteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
