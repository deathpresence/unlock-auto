#!/usr/bin/env node
const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const { loadEnvFile } = require("node:process");
const { join } = require("node:path");

// Load env files if present
try {
  loadEnvFile(join(process.cwd(), ".env"));
  loadEnvFile(join(process.cwd(), ".env.local"));
} catch {}

function buildDbUrl(baseUrl, dbName) {
  return baseUrl.replace(/\/([^/?]+)(\?.*)?$/, `/${dbName}$2`);
}

async function migrateTenantDatabase(dbName) {
  const adminUrl = process.env.POSTGRES_ADMIN_URL;
  if (!adminUrl) {
    throw new Error("POSTGRES_ADMIN_URL must be set");
  }
  const url = buildDbUrl(adminUrl, dbName);
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: "migrations/tenant" });
    // Grant privileges for runtime user (best-effort)
    try {
      await pool.query("GRANT USAGE, CREATE ON SCHEMA public TO app_user;");
      await pool.query(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;"
      );
      await pool.query(
        "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_user;"
      );
      await pool.query("CREATE SCHEMA IF NOT EXISTS drizzle;");
      await pool.query("GRANT USAGE, CREATE ON SCHEMA drizzle TO app_user;");
      await pool.query(
        "GRANT SELECT ON ALL TABLES IN SCHEMA drizzle TO app_user;"
      );
    } catch (_) {}
  } finally {
    await pool.end();
  }
}

(async () => {
  const adminUrl = process.env.POSTGRES_ADMIN_URL;
  const globalUrl = process.env.POSTGRES_URL;
  if (!(adminUrl && globalUrl)) {
    console.error("POSTGRES_ADMIN_URL and POSTGRES_URL must be set");
    process.exit(1);
  }

  // Read org->db mapping from GLOBAL database (POSTGRES_URL)
  const pool = new Pool({ connectionString: globalUrl });
  try {
    const res = await pool.query("select db_name from org_db_mapping");
    const names = res.rows.map((r) => r.db_name);
    if (names.length === 0) {
      console.log("No tenant databases found.");
      process.exit(0);
    }

    for (const dbName of names) {
      console.log(`→ Migrating tenant: ${dbName}`);
      try {
        await migrateTenantDatabase(dbName);
        console.log(`✓ Migrated: ${dbName}`);
      } catch (e) {
        console.error(`✗ Failed: ${dbName}`, e.message);
      }
    }
  } finally {
    await pool.end();
  }
})();
