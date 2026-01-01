import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { fileUploads } from "../../db/schema.js";

export type FileUploadAttributes = InferSelectModel<typeof fileUploads>;
export type FileUploadCreationAttributes = InferInsertModel<typeof fileUploads>;
