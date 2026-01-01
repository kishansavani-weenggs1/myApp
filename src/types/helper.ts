export interface CommonDBFields {
  id: number;
  updatedId: number | null;
  deletedId: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
}

/**
 * Fields allowed when creating a record
 */
export type CreationAttributes<T> = Omit<
  T,
  "id" | "createdAt" | "updatedAt" | "updatedId" | "deletedAt" | "deletedId"
>;
