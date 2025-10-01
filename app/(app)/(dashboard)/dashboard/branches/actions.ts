"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createBranch, deleteBranch, updateBranch } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";
import { BranchSchema } from "./schema";

const IdSchema = z.object({ id: z.uuid("Invalid id") });

export async function createBranchAction(formData: FormData) {
  await requireActiveOrgSession();
  const parsed = BranchSchema.safeParse({
    name: String(formData.get("name") || "").trim(),
    slug: (String(formData.get("slug") || "").trim() || null) as string | null,
    address: (String(formData.get("address") || "").trim() || null) as
      | string
      | null,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  await createBranch(parsed.data);
  redirect("/dashboard/branches");
}

export async function updateBranchAction(formData: FormData) {
  await requireActiveOrgSession();
  const idRes = IdSchema.safeParse({ id: String(formData.get("id") || "") });
  if (!idRes.success) {
    throw new Error(idRes.error.issues.map((i) => i.message).join(", "));
  }
  const parsed = BranchSchema.partial().safeParse({
    name: String(formData.get("name") || "").trim() || undefined,
    slug: (String(formData.get("slug") || "").trim() || null) as string | null,
    address: (String(formData.get("address") || "").trim() || null) as
      | string
      | null,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }
  await updateBranch(idRes.data.id, parsed.data);
  redirect("/dashboard/branches");
}

export async function deleteBranchAction(formData: FormData) {
  await requireActiveOrgSession();
  const idRes = IdSchema.safeParse({ id: String(formData.get("id") || "") });
  if (!idRes.success) {
    throw new Error(idRes.error.issues.map((i) => i.message).join(", "));
  }
  await deleteBranch(idRes.data.id);
  revalidatePath("/dashboard/branches");
}
