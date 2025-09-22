import { requireActiveOrgSession } from "@/lib/session";
import { randomUUID } from "crypto";
import { Chat } from "@/components/chat";

export default async function Page() {
  await requireActiveOrgSession();
  const id = randomUUID();

  return (
    <Chat
      id={id}
      initialMessages={[]}
      initialChatModel={"gpt-4o-mini"}
      initialVisibilityType={"private"}
      isReadonly={false}
    />
  );
}
