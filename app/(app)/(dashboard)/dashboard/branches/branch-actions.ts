"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { session as sessionSchema } from "@/db/global/schema/auth";
import { getBranchById } from "@/db/tenant/queries";
import { dbGlobal } from "@/lib/postgres";
import { getSessionOrNull } from "@/lib/session";

export async function setActiveBranch(branchId: string) {
  try {
    const data = await getSessionOrNull();
    if (!data?.session) {
      return { error: "Not authenticated" };
    }

    const { session } = data;

    if (!session.activeOrganizationId) {
      return { error: "No active organization" };
    }

    // Validate that the branch exists and belongs to the user's organization
    const branch = await getBranchById(branchId);
    if (!branch) {
      return { error: "Branch not found" };
    }

    await dbGlobal
      .update(sessionSchema)
      .set({ activeBranchId: branchId })
      .where(eq(sessionSchema.id, session.id));

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to set active branch: ${message}` };
  }
}

export async function getActiveBranch() {
  try {
    const data = await getSessionOrNull();
    if (!data?.session) {
      return null;
    }

    const [dbSession] = await dbGlobal
      .select({ activeBranchId: sessionSchema.activeBranchId })
      .from(sessionSchema)
      .where(eq(sessionSchema.id, data.session.id))
      .limit(1);

    return dbSession?.activeBranchId ?? null;
  } catch {
    return null;
  }
}

export async function clearActiveBranch() {
  try {
    const data = await getSessionOrNull();
    if (!data?.session) {
      return { error: "Not authenticated" };
    }

    await dbGlobal
      .update(sessionSchema)
      .set({ activeBranchId: null })
      .where(eq(sessionSchema.id, data.session.id));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Failed to clear active branch: ${message}` };
  }
}
