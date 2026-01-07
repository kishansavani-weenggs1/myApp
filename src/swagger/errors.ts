import { z } from "./zod.js";

export const ErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Something went wrong" }),
  })
  .openapi("Error");

export const ValidationErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Something went wrong" }),
    errors: z
      .array(
        z.object({
          field: z.string(),
          message: z.string(),
        })
      )
      .optional(),
  })
  .openapi("ValidationError");
