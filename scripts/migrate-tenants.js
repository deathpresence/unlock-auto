#!/usr/bin/env node
const { Pool } = require("pg");
const { migrateTenantDatabase } = require("../lib/tenant/pg-admin");

(async () => {
  const adminUrl = process.env.POSTGRES_ADMIN_URL;
  if (!adminUrl) {
    console.error("POSTGRES_ADMIN_URL must be set");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: adminUrl });
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
