import type { InferSelectModel } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const branch = pgTable("branch", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  slug: text("slug"),
  name: text().notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export type Branch = InferSelectModel<typeof branch>;
