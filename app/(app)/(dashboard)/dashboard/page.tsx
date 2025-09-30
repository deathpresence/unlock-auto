import { requireActiveOrgSession } from "@/lib/session";

export default async function Page() {
  await requireActiveOrgSession();

  return "dashboard";
}
