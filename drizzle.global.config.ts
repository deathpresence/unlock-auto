import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./migrations/global",
  schema: "./db/global/**/*.ts",
  casing: "snake_case",
  dbCredentials: { url: process.env.POSTGRES_URL! },
});
