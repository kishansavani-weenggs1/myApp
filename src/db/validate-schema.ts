import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  chatGroups,
  comments,
  fileUploads,
  groupMembers,
  groupMessages,
  messages,
  posts,
  users,
} from "./schema.js";

export const insertUserSchema = createInsertSchema(users);
export const updateUserSchema = insertUserSchema.omit({ id: true }).partial();
export const selectUserSchema = createSelectSchema(users);

export const insertPostSchema = createInsertSchema(posts);
export const updatePostSchema = insertPostSchema.omit({ id: true }).partial();
export const selectPostSchema = createSelectSchema(posts);

export const insertCommentSchema = createInsertSchema(comments);
export const updateCommentSchema = insertCommentSchema
  .omit({ id: true })
  .partial();
export const selectCommentSchema = createSelectSchema(comments);

export const insertFileUploadsSchema = createInsertSchema(fileUploads);
export const selectFileUploadsSchema = createSelectSchema(fileUploads);

export const insertMessageSchema = createInsertSchema(messages);
export const updateMessageSchema = insertMessageSchema
  .omit({ id: true })
  .partial();
export const selectMessageSchema = createSelectSchema(messages);

export const insertChatGroupSchema = createInsertSchema(chatGroups);
export const updateChatGroupSchema = insertChatGroupSchema
  .omit({ id: true })
  .partial();
export const selectChatGroupSchema = createSelectSchema(chatGroups);

export const insertGroupMemberSchema = createInsertSchema(groupMembers);
export const updateGroupMemberSchema = insertGroupMemberSchema
  .omit({ id: true })
  .partial();
export const selectGroupMemberSchema = createSelectSchema(groupMembers);

export const insertGroupMessageSchema = createInsertSchema(groupMessages);
export const updateGroupMessageSchema = insertGroupMessageSchema
  .omit({ id: true })
  .partial();
export const selectGroupMessageSchema = createSelectSchema(groupMessages);
