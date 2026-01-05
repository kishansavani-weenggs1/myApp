import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  chatGroups,
  comments,
  groupMembers,
  groupMessages,
  messages,
  posts,
  users,
} from "../db/schema.js";
import { fileUploads } from "../db/schema.js";

/**
 * Users
 */

export type UserAttributes = InferSelectModel<typeof users>;
export type OptionalUserAttributes = Partial<InferSelectModel<typeof users>>;
export type UserCreationAttributes = InferInsertModel<typeof users>;

/**
 * Posts
 */

export type PostAttributes = InferSelectModel<typeof posts>;
export type OptionalPostAttributes = Partial<InferSelectModel<typeof posts>>;
export type PostCreationAttributes = InferInsertModel<typeof posts>;

/**
 * Comments
 */

export type CommentAttributes = InferSelectModel<typeof comments>;
export type OptionalCommentAttributes = Partial<
  InferSelectModel<typeof comments>
>;
export type CommentCreationAttributes = InferInsertModel<typeof comments>;

/**
 * File Uploads
 */

export type FileUploadAttributes = InferSelectModel<typeof fileUploads>;
export type FileUploadCreationAttributes = InferInsertModel<typeof fileUploads>;

/**
 * Messages
 */

export type MessageAttributes = InferSelectModel<typeof messages>;
export type OptionalMessageAttributes = Partial<
  InferSelectModel<typeof messages>
>;
export type MessageCreationAttributes = InferInsertModel<typeof messages>;

/**
 * Groups
 */

export type GroupAttributes = InferSelectModel<typeof chatGroups>;
export type OptionalGroupAttributes = Partial<
  InferSelectModel<typeof chatGroups>
>;
export type GroupCreationAttributes = InferInsertModel<typeof chatGroups>;

/**
 * Group Members
 */

export type GroupMemberAttributes = InferSelectModel<typeof groupMembers>;
export type OptionalGroupMemberAttributes = Partial<
  InferSelectModel<typeof groupMembers>
>;
export type GroupMemberCreationAttributes = InferInsertModel<
  typeof groupMembers
>;

/**
 * Group Messages
 */

export type GroupMessageAttributes = InferSelectModel<typeof groupMessages>;
export type OptionalGroupMessageAttributes = Partial<
  InferSelectModel<typeof groupMessages>
>;
export type GroupMessageCreationAttributes = InferInsertModel<
  typeof groupMessages
>;
