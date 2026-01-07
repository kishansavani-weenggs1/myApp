import { registry } from "../registry.js";
import { z } from "../zod.js";
import { HTTP_STATUS } from "../../config/constants.js";
import { withCommonResponses } from "../../utils/common.js";
import { commonSuccessResponseSchema } from "../common-schema.js";
import {
  createPostSchema,
  editPostSchema,
  getPostsSchema,
} from "../../config/schema/posts.js";
import { commonDeleteSchema } from "../../config/schema/common.js";

const GetPostsResponseSchema = z
  .object({
    postDetails: z.array(z.object()).openapi({
      example: [
        { someKey: "Some Values", otherKey: "Other Values" },
        { someKey: "Some Values", otherKey: "Other Values" },
      ],
    }),
  })
  .openapi("GetPostsResponse");

registry.registerPath({
  method: "get",
  path: "/api/posts",
  summary: "Get Posts",
  description: "Get Posts",
  tags: ["Posts"],

  request: {
    query: getPostsSchema.shape.query,
  },

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: GetPostsResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/posts/create",
  summary: "Create Post",
  description: "Create Post",
  tags: ["Posts"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createPostSchema.shape.body,
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
  method: "put",
  path: "/api/posts/edit{id}",
  summary: "Edit Post",
  description: "Edit Post",
  tags: ["Posts"],

  request: {
    params: editPostSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: editPostSchema.shape.body,
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
  path: "/api/posts/delete{id}",
  summary: "Delete Post",
  description: "Delete Post",
  tags: ["Posts"],

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
