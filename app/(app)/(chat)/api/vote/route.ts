import { ChatSDKError } from "@/lib/errors";
import { requireActiveOrgSession } from "@/lib/session";
import { getChatById, getVotesByChatId, voteMessage } from "@/db/tenant/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter chatId is required."
    ).toResponse();
  }

  const session = await requireActiveOrgSession();

  const chat = await getChatById({ id: chatId });
  if (!chat) {
    return new ChatSDKError("not_found:chat").toResponse();
  }
  if (chat.userId !== session.userId) {
    return new ChatSDKError("forbidden:vote").toResponse();
  }

  const votes = await getVotesByChatId({ id: chatId });
  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const chatId = body?.chatId as string | undefined;
  const messageId = body?.messageId as string | undefined;
  const type = body?.type as ("up" | "down") | undefined;

  if (!chatId || !messageId || !type) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameters chatId, messageId, and type are required."
    ).toResponse();
  }

  const session = await requireActiveOrgSession();

  const chat = await getChatById({ id: chatId });
  if (!chat) {
    return new ChatSDKError("not_found:vote").toResponse();
  }
  if (chat.userId !== session.userId) {
    return new ChatSDKError("forbidden:vote").toResponse();
  }

  await voteMessage({ chatId, messageId, type });
  return new Response("Message voted", { status: 200 });
}


