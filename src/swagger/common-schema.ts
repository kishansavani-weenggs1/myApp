import { z } from "./zod.js";

export const commonSuccessResponseSchema = z
  .object({
    message: z.string().openapi({ example: "Something done successfully" }),
  })
  .openapi("CommonSuccessResponse");
