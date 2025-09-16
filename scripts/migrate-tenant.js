#!/usr/bin/env node

const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const path = require('path');

async function migrateTenant(orgId, dbName) {
  if (!orgId || !dbName) {
    console.error('Usage: node scripts/migrate-tenant.js <orgId> <dbName>');
    process.exit(1);
  }

  const adminUrl = process.env.POSTGRES_ADMIN_URL;
  if (!adminUrl) {
    console.error('POSTGRES_ADMIN_URL environment variable is required');
    process.exit(1);
  }

  // Build the tenant database URL
  const tenantDbUrl = adminUrl.replace(/\/([^/?]+)(\?.*)?$/, `/${dbName}$2`);
  
  console.log(`Migrating tenant database: ${dbName} for organization: ${orgId}`);

  try {
    const pool = new Pool({ connectionString: tenantDbUrl });
    const db = drizzle(pool);
    
    const migrationsFolder = path.join(process.cwd(), 'migrations', 'tenant');
    await migrate(db, { migrationsFolder });
    
    await pool.end();
    console.log(`✅ Successfully migrated tenant database: ${dbName}`);
  } catch (error) {
    console.error(`❌ Failed to migrate tenant database: ${dbName}`, error);
    process.exit(1);
  }
}

// Get arguments from command line
const [orgId, dbName] = process.argv.slice(2);
migrateTenant(orgId, dbName);

