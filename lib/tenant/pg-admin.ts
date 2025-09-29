"server only";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { setOrgDb } from "./registry";

const admin = new Pool({ connectionString: process.env.POSTGRES_ADMIN_URL! });

function buildDbUrl(baseUrl: string, dbName: string) {
  return baseUrl.replace(/\/([^/?]+)(\?.*)?$/, `/${dbName}$2`);
}

export async function createTenantDatabase(orgId: string, slug?: string) {
  const dbName = slug || `tenant_${orgId.replace(/-/g, "_")}`;

  try {
    // Check if database already exists
    const checkResult = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (checkResult.rows.length === 0) {
      // Create the database (no OWNER to avoid SET ROLE error)
      await admin.query(`CREATE DATABASE "${dbName}";`);
      console.log(`✅ Created tenant database: ${dbName}`);

      // Database-level privileges
      await admin.query(
        `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO admin_user;`
      );
      await admin.query(
        `GRANT CONNECT, TEMP ON DATABASE "${dbName}" TO app_user;`
      );
    } else {
      console.log(`ℹ️  Database ${dbName} already exists`);
    }

    // Run migrations on the tenant database
    const url = buildDbUrl(process.env.POSTGRES_ADMIN_URL!, dbName);
    const pool = new Pool({ connectionString: url });
    const db = drizzle(pool);

    try {
      await migrate(db, { migrationsFolder: "migrations/tenant" });
      console.log(`✅ Migrated tenant database: ${dbName}`);
    } catch (migrateError) {
      console.log(
        `ℹ️  Migration skipped (may already be up to date): ${dbName}`
      );
    }

    // Ensure app_user can use the public schema for runtime operations
    try {
      await pool.query("GRANT USAGE, CREATE ON SCHEMA public TO app_user;");
      await pool.query(
        "GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;"
      );
      await pool.query(
        "GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO app_user;"
      );
      // Drizzle migration metadata schema
      await pool.query("CREATE SCHEMA IF NOT EXISTS drizzle;");
      await pool.query("GRANT USAGE, CREATE ON SCHEMA drizzle TO app_user;");
      await pool.query(
        "GRANT SELECT ON ALL TABLES IN SCHEMA drizzle TO app_user;"
      );
    } catch (_e) {
      // Ignore if already granted
    }

    await pool.end();

    // Store the mapping in the global database
    await setOrgDb(orgId, dbName);

    return { dbName };
  } catch (error) {
    console.error(
      `❌ Failed to create tenant database for org ${orgId}:`,
      error
    );
    throw error;
  }
}

export async function migrateTenantDatabase(dbName: string) {
  const url = buildDbUrl(process.env.POSTGRES_ADMIN_URL!, dbName);
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: "migrations/tenant" });
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
  } finally {
    await pool.end();
  }
}
