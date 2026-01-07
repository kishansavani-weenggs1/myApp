import { z } from "../swagger/zod.js";
import {
  addOrRemoveUserInGroupSchema,
  createGroupSchema,
  editGroupSchema,
} from "../config/schema/groups.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "../config/schema/auth.js";
import {
  createCommentSchema,
  editCommentSchema,
} from "../config/schema/comments.js";
import { createPostSchema, editPostSchema } from "../config/schema/posts.js";
import {
  createGroupMessageSchema,
  createMessageSchema,
  editGroupMessageSchema,
  editMessageSchema,
} from "../config/schema/messages.js";

/**
 * Auth
 */

export type LoginBody = z.infer<typeof loginSchema>["body"];
export type SignUpBody = z.infer<typeof registerSchema>["body"];
export type changePasswordBody = z.infer<typeof changePasswordSchema>["body"];

/**
 * Posts
 */

export type CreatePostBody = z.infer<typeof createPostSchema>["body"];
export type EditPostBody = z.infer<typeof editPostSchema>["body"];

/**
 * Comments
 */

export type CreateCommentBody = z.infer<typeof createCommentSchema>["body"];
export type EditCommentBody = z.infer<typeof editCommentSchema>["body"];

/**
 * Individual Chat
 */

export type CreateMessageBody = z.infer<typeof createMessageSchema>["body"];
export type EditMessageBody = z.infer<typeof editMessageSchema>["body"];

/**
 * Group
 */

export type CreateGroupBody = z.infer<typeof createGroupSchema>["body"];
export type EditGroupBody = z.infer<typeof editGroupSchema>["body"];
export type AddOrRemoveUserInGroupBody = z.infer<
  typeof addOrRemoveUserInGroupSchema
>["body"];

/**
 * Group Messages
 */

export type CreateGroupMessageBody = z.infer<
  typeof createGroupMessageSchema
>["body"];
export type EditGroupMessageBody = z.infer<
  typeof editGroupMessageSchema
>["body"];
