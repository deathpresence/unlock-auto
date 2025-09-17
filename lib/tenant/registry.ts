'server only';

import { dbGlobal } from "@/lib/postgres";
import { eq } from "drizzle-orm";
import { organization as organizationTable } from "@/db/global/schema/auth";
import { orgDbMapping } from "@/db/global/schema/meta";
import { createTenantDatabase } from "./pg-admin";

export async function setOrgDb(orgId: string, dbName: string) {
  await dbGlobal
    .insert(orgDbMapping)
    .values({ orgId, dbName })
    .onConflictDoNothing();
}

export async function getOrgDb(orgId: string) {
  const [row] = await dbGlobal
    .select({ dbName: orgDbMapping.dbName })
    .from(orgDbMapping)
    .where(eq(orgDbMapping.orgId, orgId))
    .limit(1);
  if (!row) throw new Error("Tenant DB mapping not found");
  return row.dbName;
}

export async function getOrgSlug(orgId: string): Promise<string | null> {
  const rows = await dbGlobal
    .select({ id: organizationTable.id, slug: organizationTable.slug })
    .from(organizationTable)
    .where(eq(organizationTable.id, orgId))
    .limit(1);
  return rows[0]?.slug ?? null;
}

export async function ensureMappingExists(orgId: string): Promise<string> {
  try {
    const name = await getOrgDb(orgId);
    return name;
  } catch {
    const slug =
      (await getOrgSlug(orgId)) ?? `tenant_${orgId.replace(/-/g, "_")}`;
    const { dbName } = await createTenantDatabase(orgId, slug);
    return dbName;
  }
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
    console.log(
      `✅ Tenant setup complete for org: ${orgId}, database: ${dbName}`
    );
  }
}
