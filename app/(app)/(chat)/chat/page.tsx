import { requireActiveOrgSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";

export default async function Page() {
  const session = await requireActiveOrgSession();

  if (!session) {
    redirect("/login");
  }

  return <Chat />;
}
