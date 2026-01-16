import { z } from "./zod.js";

export const commonSuccessResponseSchema = z.object({
  message: z.string().openapi({ example: "Something done successfully" }),
});

export const ErrorSchema = z.object({
  message: z.string().openapi({ example: "Something went wrong" }),
});

export const ValidationErrorSchema = z.object({
  message: z.string().openapi({ example: "Validation failed" }),
  errors: z.string().openapi({
    example:
      "✖ Invalid input: expected string, received undefined  → at somewhere",
  }),
});
