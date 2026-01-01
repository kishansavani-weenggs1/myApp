import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { comments } from "../../db/schema.js";

export type CommentAttributes = InferSelectModel<typeof comments>;
export type OptionalCommentAttributes = Partial<
  InferSelectModel<typeof comments>
>;
export type CommentCreationAttributes = InferInsertModel<typeof comments>;
