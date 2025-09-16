import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Chat } from "@/components/chat";

export default async function Page() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  return <Chat />;
}
