import {
  mysqlTable,
  int,
  varchar,
  text,
  mysqlEnum,
  boolean,
} from "drizzle-orm/mysql-core";
import {
  createdIdCol,
  isActiveCol,
  operationIdCols,
  primaryCol,
  timestampCols,
} from "./common-columns.js";
import { MessageStatus, UserRole } from "../config/constants.js";

export const fileUploads = mysqlTable("file_uploads", {
  ...primaryCol,
  url: varchar("url", { length: 255 }).notNull(),
  size: int("size").notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  ...createdIdCol,
  ...operationIdCols,
  ...timestampCols,
});

export const users = mysqlTable("users", {
  ...primaryCol,
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", [UserRole.ADMIN, UserRole.USER])
    .notNull()
    .default(UserRole.USER),
  refreshToken: text("refresh_token"),
  tokenVersion: int("token_version").notNull().default(1),
  ...isActiveCol,
  ...operationIdCols,
  ...timestampCols,
});

export const posts = mysqlTable("posts", {
  ...primaryCol,
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageId: int("image_id").references(() => fileUploads.id),
  videoId: int("video_id").references(() => fileUploads.id),
  isPublished: boolean("is_published").notNull().default(true),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  ...isActiveCol,
  ...operationIdCols,
  ...timestampCols,
});

export const comments = mysqlTable("comments", {
  ...primaryCol,
  content: text("content").notNull(),
  isPublished: boolean("is_published").notNull().default(true),
  userId: int("user_id").references(() => users.id),
  postId: int("post_id")
    .notNull()
    .references(() => posts.id),
  ...isActiveCol,
  ...operationIdCols,
  ...timestampCols,
});

export const messages = mysqlTable("messages", {
  ...primaryCol,
  fromUserId: int("from_user_id")
    .notNull()
    .references(() => users.id),
  toUserId: int("to_user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  status: mysqlEnum("status", [
    MessageStatus.SENT,
    MessageStatus.DELIVERED,
    MessageStatus.READ,
  ])
    .notNull()
    .default(MessageStatus.SENT),
  ...operationIdCols,
  ...timestampCols,
});

export const chatGroups = mysqlTable("chat_groups", {
  ...primaryCol,
  groupName: varchar("group_name", { length: 255 }).notNull(),
  groupAdminId: int("group_admin_id")
    .notNull()
    .references(() => users.id),
  ...operationIdCols,
  ...timestampCols,
});

export const groupMembers = mysqlTable("group_members", {
  ...primaryCol,
  groupId: int("group_id")
    .notNull()
    .references(() => chatGroups.id),
  userId: int("user_id")
    .notNull()
    .references(() => users.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  ...createdIdCol,
  ...operationIdCols,
  ...timestampCols,
});

export const groupMessages = mysqlTable("group_messages", {
  ...primaryCol,
  fromUserId: int("from_user_id")
    .notNull()
    .references(() => users.id),
  groupId: int("group_id")
    .notNull()
    .references(() => chatGroups.id),
  message: text("message").notNull(),
  status: mysqlEnum("status", [
    MessageStatus.SENT,
    MessageStatus.DELIVERED,
    MessageStatus.READ,
  ])
    .notNull()
    .default(MessageStatus.SENT),
  ...operationIdCols,
  ...timestampCols,
});
