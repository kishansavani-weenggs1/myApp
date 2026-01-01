import { sql } from "drizzle-orm";
import { boolean, datetime, int } from "drizzle-orm/mysql-core";

// Columns used in every table

export const primaryCol = {
  id: int("id").autoincrement().primaryKey(),
};

export const isActiveCol = {
  isActive: boolean("is_active").notNull().default(true),
};

export const timestampCols = {
  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),

  deletedAt: datetime("deleted_at"),
};

export const operationIdCols = {
  updatedId: int("updated_id"),
  deletedId: int("deleted_id"),
};
