import { requireActiveOrgSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  await requireActiveOrgSession();

  redirect("/dashboard");
}
