import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const maybeMessages: UIMessage[] | undefined = body?.messages;
  const id: string | undefined = body?.id;
  const message: any = body?.message;
  const visibility: any = body?.selectedVisibilityType ?? "private";

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY in environment" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  // If client passed chat id + message, ensure chat exists and persist user message first
  if (id && message) {
    const session = await requireActiveOrgSession();

    const existing = await getChatById({ id });
    if (!existing) {
      const titlePart = Array.isArray(message?.parts)
        ? (message.parts.find((p: any) => p?.type === "text")?.text ?? "New chat")
        : (message?.content ?? "New chat");
      const title = String(titlePart).slice(0, 80) || "New chat";
      await saveChat({ id, userId: session.userId!, title, visibility });
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: message.id,
          role: "user",
          parts: message.parts ?? [{ type: "text", text: message?.content ?? "" }],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(
      maybeMessages ?? (message ? [message] : [])
    ),
    system:
      "You are a helpful assistant that can answer questions and help with tasks",
  });

  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing chat id" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  await deleteChatById({ id });
  return new Response(null, { status: 204 });
}
