import { randomUUID } from "node:crypto";
import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStream,
  JsonToSseTransformStream,
  streamText,
  type UIMessage,
} from "ai";
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessagesByChatId,
  saveChat,
  saveMessages,
  updateChatLastContextById,
} from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";

export const maxDuration = 60;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const idFromBody: string | undefined = body?.id ?? body?.chatId;
  const message: any = body?.message;
  const modelId: string | undefined = body?.model ?? body?.selectedChatModel;
  const visibility: any = body?.selectedVisibilityType ?? "private";

  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY in environment" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const resolvedChatId: string | undefined = idFromBody;
  const chatIdToUse = resolvedChatId || randomUUID();

  if (message) {
    const session = await requireActiveOrgSession();
    try {
      const existing = await getChatById({ id: chatIdToUse });
      if (!existing) {
        const titlePart = Array.isArray(message?.parts)
          ? (message.parts.find((p: any) => p?.type === "text")?.text ??
            "New chat")
          : (message?.content ?? "New chat");
        const title = String(titlePart).slice(0, 80) || "New chat";
        await saveChat({
          id: chatIdToUse,
          userId: session.userId!,
          title,
          visibility,
        });
      }
    } catch (_e) {
      const titlePart = Array.isArray(message?.parts)
        ? (message.parts.find((p: any) => p?.type === "text")?.text ??
          "New chat")
        : (message?.content ?? "New chat");
      const title = String(titlePart).slice(0, 80) || "New chat";
      await saveChat({
        id: chatIdToUse,
        userId: session.userId!,
        title,
        visibility,
      });
    }

    const messageId: string = message.id || randomUUID();

    await saveMessages({
      messages: [
        {
          chatId: chatIdToUse,
          id: messageId,
          role: "user",
          parts: message.parts ?? [
            { type: "text", text: message?.content ?? "" },
          ],
          attachments: [],
          createdAt: new Date(),
        },
      ],
    });
  }

  // Load prior messages for full context
  const existingMessages = await getMessagesByChatId({ id: chatIdToUse });
  const uiMessages: UIMessage[] = [
    ...(convertToModelMessages([]) && []), // no-op to keep types happy
  ];
  // Convert DB messages to UIMessage format the model expects
  for (const m of existingMessages) {
    uiMessages.push({
      id: m.id as any,
      role: m.role as any,
      parts: (m.parts as any) ?? [],
    } as UIMessage);
  }
  if (message) {
    uiMessages.push(message);
  }

  const streamId = randomUUID();
  try {
    await createStreamId({ streamId, chatId: chatIdToUse });
  } catch (_e) {
    // If stream id persistence fails (e.g., FK missing chat), continue streaming without resumable id
  }

  let finalUsage: any | undefined;

  const stream = createUIMessageStream({
    execute: ({ writer: dataStream }) => {
      const result = streamText({
        model: openai(modelId || "gpt-4o-mini"),
        messages: convertToModelMessages(uiMessages),
        system:
          "You are a helpful assistant that can answer questions and help with tasks",
        onFinish: ({ usage }) => {
          finalUsage = usage;
          dataStream.write({ type: "data-usage", data: usage });
        },
      });

      result.consumeStream();

      dataStream.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
        })
      );
    },
    generateId: randomUUID,
    onFinish: async ({ messages }) => {
      // Persist assistant messages from this turn
      const toPersist = messages.map((m) => ({
        id: m.id,
        role: m.role as any,
        parts: m.parts as any,
        createdAt: new Date(),
        attachments: [],
        chatId: chatIdToUse,
      }));
      if (toPersist.length > 0) {
        await saveMessages({ messages: toPersist as any });
      }
      if (finalUsage) {
        await updateChatLastContextById({
          chatId: chatIdToUse,
          context: finalUsage,
        });
      }
    },
    onError: () => "Oops, an error occurred!",
  });

  return new Response(stream.pipeThrough(new JsonToSseTransformStream()));
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
  // Ensure ownership before deleting
  const session = await requireActiveOrgSession();
  const existing = await getChatById({ id });
  if (!existing) {
    return new Response(null, { status: 204 });
  }
  if (existing.userId !== session.userId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  await deleteChatById({ id });
  return new Response(null, { status: 204 });
}
