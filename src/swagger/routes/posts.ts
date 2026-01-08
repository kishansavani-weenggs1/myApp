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
import { uploadFileSchema } from "../../config/schema/fileUploads.js";

const GetPostsResponseSchema = z.object({
  postDetails: z.array(z.object()).openapi({
    example: [
      { someKey: "Some Values", otherKey: "Other Values" },
      { someKey: "Some Values", otherKey: "Other Values" },
    ],
  }),
});

const uploadFilesResponseSchema = z.object({
  count: z.number().positive().openapi({ example: 5 }),
  files: z.array(
    z.object({
      id: z.number().positive().openapi({ example: 1234 }),
      url: z.string().openapi({ example: "posts\\timestamp-yourfilename.ext" }),
    })
  ),
  message: z.string().openapi({ example: "File uploaded successfully" }),
});

const mainImageUploadSchema = z.object({
  main_image: z.any().openapi({
    type: "string",
    format: "binary",
    description: "Upload a image",
  }),
});

const videoUploadSchema = z.object({
  video: z.any().openapi({
    type: "string",
    format: "binary",
    description: "Upload a video",
  }),
});

const otherImagesUploadSchema = z.object({
  other_images: z
    .array(
      z.any().openapi({
        type: "string",
        format: "binary",
      })
    )
    .openapi({
      description: "Upload multiple images",
    }),
});

/**
 * Posts
 */

registry.registerPath({
  method: "get",
  path: "/api/posts",
  summary: "Get Posts",
  description: "Get Posts",
  tags: ["Posts"],

  request: {
    query: getPostsSchema.shape.query,
  },

  responses: withCommonResponses(
    {
      [HTTP_STATUS.OK]: {
        description: "Success",
        content: {
          "application/json": {
            schema: GetPostsResponseSchema,
          },
        },
      },
    },
    [HTTP_STATUS.NOT_FOUND]
  ),
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
    [HTTP_STATUS.NOT_FOUND]
  ),
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

/**
 * Main Image Upload
 */

registry.registerPath({
  method: "post",
  path: "/api/upload/main-image/{postId}",
  summary: "Upload Main Image",
  description: "Upload Main Image",
  tags: ["Upload Files"],
  request: {
    params: uploadFileSchema.shape.params,
    body: {
      content: {
        "multipart/form-data": {
          schema: mainImageUploadSchema,
        },
      },
    },
  },
  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: uploadFilesResponseSchema,
        },
      },
    },
  }),
});

/**
 * Other Images Upload
 */

registry.registerPath({
  method: "post",
  path: "/api/upload/other-images/{postId}",
  summary: "Upload Other Images",
  description: "Upload Other Images",
  tags: ["Upload Files"],
  request: {
    params: uploadFileSchema.shape.params,
    body: {
      content: {
        "multipart/form-data": {
          schema: otherImagesUploadSchema,
        },
      },
    },
  },
  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: uploadFilesResponseSchema,
        },
      },
    },
  }),
});

/**
 * Video Upload
 */

registry.registerPath({
  method: "post",
  path: "/api/upload/video/{postId}",
  summary: "Upload Video",
  description: "Upload Video",
  tags: ["Upload Files"],
  request: {
    params: uploadFileSchema.shape.params,
    body: {
      content: {
        "multipart/form-data": {
          schema: videoUploadSchema,
        },
      },
    },
  },
  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: uploadFilesResponseSchema,
        },
      },
    },
  }),
});
