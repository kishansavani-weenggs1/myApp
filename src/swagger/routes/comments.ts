import { registry } from "../registry.js";
import { z } from "../zod.js";
import { HTTP_STATUS } from "../../config/constants.js";
import { withCommonResponses } from "../../utils/common.js";
import { commonSuccessResponseSchema } from "../common-schema.js";
import { commonDeleteSchema } from "../../config/schema/common.js";
import {
  createCommentSchema,
  editCommentSchema,
  getCommentsSchema,
} from "../../config/schema/comments.js";

const GetCommentsResponseSchema = z.object({
  commentDetails: z.array(z.object()).openapi({
    example: [
      { someKey: "Some Values", otherKey: "Other Values" },
      { someKey: "Some Values", otherKey: "Other Values" },
    ],
  }),
});

registry.registerPath({
  method: "get",
  path: "/api/comments",
  summary: "Get Comments",
  description: "Get Comments",
  tags: ["Comments"],
  security: [],

  request: {
    query: getCommentsSchema.shape.query,
  },

  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: GetCommentsResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.UNAUTHORIZED]
  ),
});

registry.registerPath({
  method: "post",
  path: "/api/comments/create",
  summary: "Create Comment",
  description: "Create Comment",
  tags: ["Comments"],
  security: [],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createCommentSchema.shape.body,
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
    [HTTP_STATUS.UNAUTHORIZED]
  ),
});

registry.registerPath({
  method: "put",
  path: "/api/comments/edit{id}",
  summary: "Edit Comment",
  description: "Edit Comment",
  tags: ["Comments"],

  request: {
    params: editCommentSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: editCommentSchema.shape.body,
        },
      },
    },
  },

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

registry.registerPath({
  method: "delete",
  path: "/api/comments/delete{id}",
  summary: "Delete Comment",
  description: "Delete Comment",
  tags: ["Comments"],

  request: {
    params: commonDeleteSchema.shape.params,
  },

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
