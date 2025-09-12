import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";

export const orgDbMapping = pgTable(
  "org_db_mapping",
  {
    orgId: uuid().notNull(),
    dbName: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.orgId] })]
);
