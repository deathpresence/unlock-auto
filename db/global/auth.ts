import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

import { InferSelectModel } from "drizzle-orm";

export const user = pgTable("user", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  role: text(),
  banned: boolean().default(false),
  banReason: text(),
  banExpires: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: varchar({ length: 45 }),
  userAgent: text(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text(),
  activeOrganizationId: text(),
});

export const account = pgTable("account", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: varchar({ length: 255 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
    .defaultNow(),
});

export const verification = pgTable("verification", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull()
    .defaultNow(),
});

export const organization = pgTable("organization", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  slug: text().unique(),
  logo: text(),
  createdAt: timestamp().notNull(),
  metadata: text(),
});

export const member = pgTable("member", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text().default("member").notNull(),
  createdAt: timestamp().notNull(),
});

export const invitation = pgTable("invitation", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  organizationId: text()
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text().notNull(),
  role: text(),
  status: text().default("pending").notNull(),
  expiresAt: timestamp().notNull(),
  inviterId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;
export type Organization = InferSelectModel<typeof organization>;
export type Member = InferSelectModel<typeof member>;
export type Invitation = InferSelectModel<typeof invitation>;
