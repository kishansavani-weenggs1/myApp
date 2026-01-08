import { z } from "./zod.js";

export const commonSuccessResponseSchema = z.object({
  message: z.string().openapi({ example: "Something done successfully" }),
});

export const ErrorSchema = z.object({
  message: z.string().openapi({ example: "Something went wrong" }),
});

export const UnauthorizedErrorSchema = z
  .string()
  .openapi({ example: "Unauthorized" });

export const ValidationErrorSchema = z.object({
  message: z.string().openapi({ example: "Something went wrong" }),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      })
    )
    .optional(),
});
