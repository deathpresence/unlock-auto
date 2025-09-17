#!/usr/bin/env node
const { spawn } = require("node:child_process");
const { join } = require("node:path");
const { loadEnvFile } = require("node:process");

// Load .env and .env.local if present (only for missing vars)
const cwd = process.cwd();
loadEnvFile(join(cwd, ".env"));

const dbName = process.argv[2];
if (!dbName) {
  console.error("Usage: npm run studio:tenant <TENANT_DB_NAME>");
  process.exit(1);
}

const adminUrl = process.env.POSTGRES_ADMIN_URL;
const appPass = process.env.POSTGRES_APP_PASSWORD;
if (!adminUrl || !appPass) {
  console.error("POSTGRES_ADMIN_URL and POSTGRES_APP_PASSWORD must be set");
  process.exit(1);
}

try {
  const u = new URL(adminUrl);
  u.username = "app_user";
  u.password = appPass;
  const parts = u.pathname.split("/").filter(Boolean);
  parts[parts.length - 1] = dbName;
  u.pathname = `/${parts.join("/")}`;

  const env = { ...process.env, POSTGRES_ADMIN_URL: u.toString() };

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["drizzle-kit", "studio", "--config=drizzle.tenant.config.ts"],
    { stdio: "inherit", env }
  );

  child.on("exit", (code) => process.exit(code || 0));
} catch (e) {
  console.error("Invalid POSTGRES_ADMIN_URL:", e.message);
  process.exit(1);
}
