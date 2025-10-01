import { listBranches } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";
import { BranchesDataTable } from "./data-table";

function formatBranches(
  rows: Array<{
    id: string;
    slug: string | null;
    name: string;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>
): Array<{
  id: string;
  slug: string | null;
  name: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}> {
  return rows.map((r) => ({
    id: String(r.id),
    slug: r.slug ? String(r.slug) : null,
    name: String(r.name),
    address: r.address ? String(r.address) : null,
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  }));
}

export const dynamic = "force-dynamic";

export default async function BranchesPage() {
  await requireActiveOrgSession();
  const data = await listBranches();
  const rows = formatBranches(data);

  return <BranchesDataTable rows={rows} />;
}
