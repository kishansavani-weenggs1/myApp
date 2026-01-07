import { registry } from "../registry.js";
import { z } from "../zod.js";
import { HTTP_STATUS } from "../../config/constants.js";
import { withCommonResponses } from "../../utils/common.js";
import { commonSuccessResponseSchema } from "../common-schema.js";
import { commonDeleteSchema } from "../../config/schema/common.js";
import {
  createGroupMessageSchema,
  createMessageSchema,
  editGroupMessageSchema,
  editMessageSchema,
  getGroupMessagesSchema,
} from "../../config/schema/messages.js";
import {
  addOrRemoveUserInGroupSchema,
  createGroupSchema,
  editGroupSchema,
} from "../../config/schema/groups.js";

/**
 * Individual Chat
 */

const GetMessagesResponseSchema = z
  .object({
    receivedMessages: z.array(z.object()).openapi({
      example: [
        { someKey: "Some Values", otherKey: "Other Values" },
        { someKey: "Some Values", otherKey: "Other Values" },
      ],
    }),
  })
  .openapi("GetMessagesResponse");

registry.registerPath({
  method: "get",
  path: "/api/chat/get-messages",
  summary: "Get Messages",
  description: "Get Messages",
  tags: ["Individual Chat"],

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: GetMessagesResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/chat/send-message",
  summary: "Send Message",
  description: "Send Message",
  tags: ["Individual Chat"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createMessageSchema.shape.body,
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
  path: "/api/chat/edit-message{id}",
  summary: "Edit Message",
  description: "Edit Message",
  tags: ["Individual Chat"],

  request: {
    params: editMessageSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: editMessageSchema.shape.body,
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
  path: "/api/chat/delete-message{id}",
  summary: "Delete Message",
  description: "Delete Message",
  tags: ["Individual Chat"],

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
 * Group
 */

const GetGroupsResponseSchema = z
  .object({
    groups: z.array(z.object()).openapi({
      example: [
        { someKey: "Some Values", otherKey: "Other Values" },
        { someKey: "Some Values", otherKey: "Other Values" },
      ],
    }),
  })
  .openapi("GetGroupsResponse");

registry.registerPath({
  method: "get",
  path: "/api/chat/groups/get",
  summary: "Get Groups",
  description: "Get Groups",
  tags: ["Groups"],

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: GetGroupsResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/chat/groups/create",
  summary: "Create Group",
  description: "Create Group",
  tags: ["Groups"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createGroupSchema.shape.body,
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
  path: "/api/chat/groups/edit{id}",
  summary: "Edit Group",
  description: "Edit Group",
  tags: ["Groups"],

  request: {
    params: editGroupSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: editGroupSchema.shape.body,
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
  path: "/api/chat/groups/delete{id}",
  summary: "Delete Group",
  description: "Delete Group",
  tags: ["Groups"],

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

registry.registerPath({
  method: "post",
  path: "/api/chat/groups/add-user",
  summary: "Add Group Member",
  description: "Add Group Member",
  tags: ["Groups"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: addOrRemoveUserInGroupSchema.shape.body,
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
  path: "/api/chat/groups/remove-user",
  summary: "Remove Group Member",
  description: "Remove Group Member",
  tags: ["Groups"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: addOrRemoveUserInGroupSchema.shape.body,
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

/**
 * Group Messages
 */

const GetGroupMessagesResponseSchema = z
  .object({
    messages: z.array(z.object()).openapi({
      example: [
        { someKey: "Some Values", otherKey: "Other Values" },
        { someKey: "Some Values", otherKey: "Other Values" },
      ],
    }),
  })
  .openapi("GetGroupMessagesResponse");

registry.registerPath({
  method: "get",
  path: "/api/chat/groups/get-messages{groupId}",
  summary: "Get Group Messages",
  description: "Get Group Messages",
  tags: ["Group Messages"],

  request: {
    params: getGroupMessagesSchema.shape.params,
  },

  responses: withCommonResponses({
    [HTTP_STATUS.OK]: {
      description: "Success",
      content: {
        "application/json": {
          schema: GetGroupMessagesResponseSchema,
        },
      },
    },
  }),
});

registry.registerPath({
  method: "post",
  path: "/api/chat/groups/send-message",
  summary: "Send Group Message",
  description: "Send Group Message",
  tags: ["Group Messages"],

  request: {
    body: {
      content: {
        "application/json": {
          schema: createGroupMessageSchema.shape.body,
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
  path: "/api/chat/groups/edit-message{id}",
  summary: "Edit Group Message",
  description: "Edit Group Message",
  tags: ["Group Messages"],

  request: {
    params: editGroupMessageSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: editGroupMessageSchema.shape.body,
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
  path: "/api/chat/groups/delete-message{id}",
  summary: "Delete Group Message",
  description: "Delete Group Message",
  tags: ["Group Messages"],

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
