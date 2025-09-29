import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Chat } from "@/components/chat";
import { getChatById, getMessagesByChatId } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await requireActiveOrgSession();

  if (chat.visibility === "private") {
    if (!session.userId) {
      return notFound();
    }

    if (session.userId !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialChatModel={"gpt-4o-mini"}
          initialLastContext={chat.lastContext ?? undefined}
          initialMessages={uiMessages}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.userId !== chat.userId}
        />
        {/* <DataStreamHandler /> */}
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialChatModel={chatModelFromCookie.value}
        initialLastContext={chat.lastContext ?? undefined}
        initialMessages={uiMessages}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.userId !== chat.userId}
      />
      {/* <DataStreamHandler /> */}
    </>
  );
}
