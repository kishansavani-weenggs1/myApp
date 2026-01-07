import { registry } from "../registry.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../../config/schema/auth.js";
import { z } from "../zod.js";
import { HTTP_STATUS } from "../../config/constants.js";
import { withCommonResponses } from "../../utils/common.js";
import { commonSuccessResponseSchema } from "../common-schema.js";

const LoginResponseSchema = z
  .object({
    accessToken: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
  })
  .openapi("LoginResponse");

const ChangePasswordResponseSchema = z
  .object({
    accessToken: z.string().openapi({
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    }),
    message: z.string().openapi({ example: "Password changed successfully" }),
  })
  .openapi("ChangePasswordResponse");

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "User login",
  description: "Authenticate user and return JWT token",
  tags: ["Auth"],
  security: [],

  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: LoginResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/auth/signup",
  summary: "User Signup",
  description: "User Signup",
  tags: ["Auth"],
  security: [],

  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.shape.body,
        },
      },
    },
  },

  responses: withCommonResponses({
    [HTTP_STATUS.CREATED]: {
      description: "Success",
      content: {
        "application/json": {
          schema: commonSuccessResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/auth/change-password",
  summary: "Change Password",
  description: "Change Password",
  tags: ["Auth"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: changePasswordSchema.shape.body,
        },
      },
    },
  },

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: ChangePasswordResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "get",
  path: "/api/auth/logout",
  summary: "Logout",
  description: "Logout",
  tags: ["Auth"],

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: commonSuccessResponseSchema,
        },
      },
    },
  }),
});
