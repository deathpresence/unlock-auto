import { randomUUID } from "node:crypto";
import { Chat } from "@/components/chat";
import { requireActiveOrgSession } from "@/lib/session";

export default async function Page() {
  await requireActiveOrgSession();
  const id = randomUUID();

  return (
    <Chat
      id={id}
      initialChatModel={"gpt-4o-mini"}
      initialMessages={[]}
      initialVisibilityType={"private"}
      isReadonly={false}
    />
  );
}
