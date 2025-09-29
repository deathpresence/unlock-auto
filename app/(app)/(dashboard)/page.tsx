import { redirect } from "next/navigation";
import { requireActiveOrgSession } from "@/lib/session";

export default async function Page() {
  const session = await requireActiveOrgSession();

  if (!session) {
    redirect("/login");
  }

  return "dashboard";
}
