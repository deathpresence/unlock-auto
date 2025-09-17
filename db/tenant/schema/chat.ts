import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  jsonb,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from "drizzle-orm/pg-core";
import type { AppUsage } from "@/lib/usage";

export const chat = pgTable("chat", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("created_at").notNull(),
  title: text().notNull(),
  // Store creator's global user id without cross-database FK
  userId: uuid("user_id").notNull(),
  visibility: varchar({ enum: ["public", "private"] })
    .notNull()
    .default("private"),
  lastContext: jsonb("last_context").$type<AppUsage | null>(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable("message", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id),
  role: varchar("role").notNull(),
  parts: json("parts").notNull(),
  attachments: json("attachments").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

export const vote = pgTable(
  "vote",
  {
    chatId: uuid("chat_id")
      .notNull()
      .references(() => chat.id),
    messageId: uuid("message_id")
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean("is_upvoted").notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    },
  ]
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  "document",
  {
    id: uuid().notNull().defaultRandom(),
    createdAt: timestamp("created_at").notNull(),
    title: text().notNull(),
    content: text(),
    kind: varchar({ enum: ["text", "code", "image", "sheet"] })
      .notNull()
      .default("text"),
    // Author's global user id, no cross-database FK
    userId: uuid("user_id").notNull(),
  },
  (table) => [{
    pk: primaryKey({ columns: [table.id, table.createdAt] }),
  }]
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  "suggestion",
  {
    id: uuid().notNull().defaultRandom(),
    documentId: uuid("document_id").notNull(),
    documentCreatedAt: timestamp("document_created_at").notNull(),
    originalText: text("original_text").notNull(),
    suggestedText: text("suggested_text").notNull(),
    description: text(),
    isResolved: boolean("is_resolved").notNull().default(false),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at").notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
      documentRef: foreignKey({
        columns: [table.documentId, table.documentCreatedAt],
        foreignColumns: [document.id, document.createdAt],
      }),
    },
  ]
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  "stream",
  {
    id: uuid().notNull().defaultRandom(),
    chatId: uuid().notNull(),
    createdAt: timestamp().notNull(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
      chatRef: foreignKey({
        columns: [table.chatId],
        foreignColumns: [chat.id],
      }),
    },
  ]
);

export type Stream = InferSelectModel<typeof stream>;
