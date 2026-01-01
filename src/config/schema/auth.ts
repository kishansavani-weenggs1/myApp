import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.email(),
    password: z.string(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string(),
  }),
});
