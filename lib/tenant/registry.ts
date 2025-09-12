import { dbGlobal } from "@/lib/postgres";
import { orgDbMapping } from "@/db/global/meta";
import { eq } from "drizzle-orm";
import { createTenantDatabase } from "./pg-admin";

export async function setOrgDb(orgId: string, dbName: string) {
  await dbGlobal
    .insert(orgDbMapping)
    .values({ orgId, dbName })
    .onConflictDoNothing();
}

export async function getOrgDb(orgId: string) {
  const [row] = await dbGlobal
    .select()
    .from(orgDbMapping)
    .where(eq(orgDbMapping.orgId, orgId));
  if (!row) throw new Error("Tenant DB mapping not found");
  return row.dbName;
}

export async function ensureTenantDb(orgId: string, slug: string) {
  try {
    // Check if mapping already exists
    await getOrgDb(orgId);
    console.log(`ℹ️  Tenant DB mapping already exists for org: ${orgId}`);
  } catch (error) {
    // Create the tenant database and store the mapping
    console.log(`🚀 Creating tenant database for org: ${orgId}`);
    const { dbName } = await createTenantDatabase(orgId, slug);
    console.log(`✅ Tenant setup complete for org: ${orgId}, database: ${dbName}`);
  }
}
