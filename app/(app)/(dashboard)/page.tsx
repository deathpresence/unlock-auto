import { requireActiveOrgSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await requireActiveOrgSession();

  if (!session) {
    redirect("/login");
  }

  return "dashboard";
}
