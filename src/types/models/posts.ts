import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { posts } from "../../db/schema.js";

export type PostAttributes = InferSelectModel<typeof posts>;
export type OptionalPostAttributes = Partial<InferSelectModel<typeof posts>>;
export type PostCreationAttributes = InferInsertModel<typeof posts>;
