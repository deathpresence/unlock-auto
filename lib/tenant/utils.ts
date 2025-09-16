import { getTenantDb } from "./pg-runtime";
import { getOrgDb } from "./registry";
import * as tenantSchema from "@/db/tenant/schema";

/**
 * Get a tenant database connection with schema for an organization
 */
export async function getTenantDbWithSchema(orgId: string) {
  const dbName = await getOrgDb(orgId);
  const db = getTenantDb(orgId, dbName);
  
  return {
    db,
    dbName,
    schema: tenantSchema,
  };
}

/**
 * Execute a function with tenant database context
 */
export async function withTenantDb<T>(
  orgId: string,
  callback: (db: ReturnType<typeof getTenantDb>, schema: typeof tenantSchema) => Promise<T>
): Promise<T> {
  const { db, schema } = await getTenantDbWithSchema(orgId);
  return callback(db, schema);
}

/**
 * Get the current user's active organization database
 */
export async function getCurrentTenantDb(session: { activeOrganizationId?: string | null }) {
  if (!session.activeOrganizationId) {
    throw new Error("No active organization found in session");
  }
  
  return getTenantDbWithSchema(session.activeOrganizationId);
}

