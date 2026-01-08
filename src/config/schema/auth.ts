import { z } from "../../swagger/zod.js";

export const loginSchema = z.object({
  body: z.object({
    email: z.email().openapi({ example: "youremail@example.com" }),
    password: z.string().openapi({ example: "Your Password" }),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().openapi({ example: "John" }),
    email: z.email().openapi({ example: "youremail@example.com" }),
    password: z.string().openapi({ example: "Your Password" }),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().openapi({ example: "Your Old Password" }),
    newPassword: z.string().openapi({ example: "Your New Password" }),
  }),
});
