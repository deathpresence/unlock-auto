"server only";

import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

const cache = new Map<string, { pool: Pool; db: NodePgDatabase }>();

// TODO; Change to pgbouncer url
function urlForDb(dbName: string) {
  // Bypass PgBouncer for tenant runtime to avoid password type mismatch.
  // Build a direct Postgres URL using app_user credentials.
  const base = process.env.POSTGRES_ADMIN_URL!;
  const appPassword = process.env.POSTGRES_APP_PASSWORD!;
  const u = new URL(base);
  u.username = "app_user";
  u.password = appPassword;
  // Ensure path is the tenant database name
  const parts = u.pathname.split("/").filter(Boolean);
  parts[parts.length - 1] = dbName;
  u.pathname = `/${parts.join("/")}`;
  return u.toString();
}

export function getTenantDb(orgId: string, dbName: string): NodePgDatabase {
  const key = `${orgId}:${dbName}`;
  const cached = cache.get(key);
  if (cached) return cached.db;

  const pool = new Pool({ connectionString: urlForDb(dbName), max: 10 });
  const db = drizzle(pool);
  cache.set(key, { pool, db });
  return db;
}
