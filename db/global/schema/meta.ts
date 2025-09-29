import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const orgDbMapping = pgTable(
  "org_db_mapping",
  {
    orgId: uuid("org_id").notNull(),
    dbName: text("db_name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.orgId] })]
);
