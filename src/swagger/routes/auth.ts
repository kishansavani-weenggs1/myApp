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

const LoginResponseSchema = z.object({
  accessToken: z.string().openapi({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
});

const ChangePasswordResponseSchema = z.object({
  accessToken: z.string().openapi({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  }),
  message: z.string().openapi({ example: "Password changed successfully" }),
});

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

  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: LoginResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.NOT_FOUND]
  ),
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

  responses: withCommonResponses(
    {
      [HTTP_STATUS.CREATED]: {
        description: "Success",
        content: {
          "application/json": {
            schema: commonSuccessResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.UNAUTHORIZED, HTTP_STATUS.NOT_FOUND]
  ),
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

  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: ChangePasswordResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.NOT_FOUND]
  ),
});

registry.registerPath({
  method: "get",
  path: "/api/auth/logout",
  summary: "Logout",
  description: "Logout",
  tags: ["Auth"],

  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: commonSuccessResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.NOT_FOUND]
  ),
});

registry.registerPath({
  method: "get",
  path: "/api/auth/refresh-token",
  summary: "Refresh Access Token",
  description: "Refresh Access Token",
  tags: ["Auth"],
  security: [],
  parameters: [
    {
      name: "refreshToken",
      in: "cookie",
      required: true,
      schema: {
        type: "string",
      },
      description: "http cookie",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  ],
  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: LoginResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.NOT_FOUND]
  ),
});
