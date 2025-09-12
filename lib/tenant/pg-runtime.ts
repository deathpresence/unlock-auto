import { Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";

const cache = new Map<string, { pool: Pool; db: NodePgDatabase }>();

function urlForDb(dbName: string) {
  const base = process.env.PGBOUNCER_URL ?? process.env.POSTGRES_ADMIN_URL!;
  return base.replace(/\/([^/?]+)(\?.*)?$/, `/${dbName}$2`);
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
