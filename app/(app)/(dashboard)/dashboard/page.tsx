import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  return "dashboard";
}
