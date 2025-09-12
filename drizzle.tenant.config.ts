import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./migrations/tenant",
  schema: "./db/tenant/**/*.ts",
  casing: "snake_case",
  dbCredentials: { url: process.env.POSTGRES_ADMIN_URL! },
});
