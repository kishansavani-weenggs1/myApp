import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { users } from "../../db/schema.js";

export type UserAttributes = InferSelectModel<typeof users>;
export type OptionalUserAttributes = Partial<InferSelectModel<typeof users>>;
export type UserCreationAttributes = InferInsertModel<typeof users>;
