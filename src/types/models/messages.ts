import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { messages } from "../../db/schema.js";

export type MessageAttributes = InferSelectModel<typeof messages>;
export type OptionalMessageAttributes = Partial<
  InferSelectModel<typeof messages>
>;
export type MessageCreationAttributes = InferInsertModel<typeof messages>;
