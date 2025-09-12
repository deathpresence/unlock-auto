import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial().primaryKey(),
  name: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
