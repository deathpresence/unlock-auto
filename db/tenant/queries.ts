import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { cache } from "react";
import { ChatSDKError } from "@/lib/errors";
import { getSessionOrNull } from "@/lib/session";
import { getCurrentTenantDb } from "@/lib/tenant/utils";
import type { AppUsage } from "@/lib/usage";
import type { Chat, DBMessage, Suggestion } from "./schema/chat";

async function getCtx() {
  const data = await getSessionOrNull();
  if (!data) {
    throw new ChatSDKError("bad_request:auth", "Not authenticated");
  }
  const { session } = data as {
    session: { activeOrganizationId?: string | null; userId?: string };
  };
  if (!session?.activeOrganizationId) {
    throw new ChatSDKError(
      "bad_request:auth",
      "No active organization selected"
    );
  }
  const { db, schema, dbName } = await getCurrentTenantDb(session);
  return { db, schema, session, dbName };
}

export const listBranches = cache(async () => {
  const { db, schema } = await getCtx();
  try {
    return await db
      .select()
      .from(schema.branch)
      .orderBy(desc(schema.branch.createdAt));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to list branches: ${message}`
    );
  }
});

export const getBranchById = cache(async (id: string) => {
  try {
    const { db, schema } = await getCtx();
    const [row] = await db
      .select()
      .from(schema.branch)
      .where(eq(schema.branch.id, id));
    return row ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to get branch: ${message}`
    );
  }
});

export async function createBranch(input: {
  name: string;
  slug?: string | null;
  address?: string | null;
}) {
  try {
    const { db, schema } = await getCtx();
    const [row] = await db
      .insert(schema.branch)
      .values({
        name: input.name,
        slug: input.slug ?? null,
        address: input.address ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to create branch: ${message}`
    );
  }
}

export async function updateBranch(
  id: string,
  input: { name?: string; slug?: string | null; address?: string | null }
) {
  try {
    const { db, schema } = await getCtx();
    const [row] = await db
      .update(schema.branch)
      .set({
        name: input.name,
        slug: input.slug,
        address: input.address,
        updatedAt: new Date(),
      })
      .where(eq(schema.branch.id, id))
      .returning();
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to update branch: ${message}`
    );
  }
}

export async function deleteBranch(id: string) {
  try {
    const { db, schema } = await getCtx();
    const [row] = await db
      .delete(schema.branch)
      .where(eq(schema.branch.id, id))
      .returning();
    return row;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ChatSDKError(
      "bad_request:database",
      `Failed to delete branch: ${message}`
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: any;
}) {
  try {
    const { db, schema } = await getCtx();
    return await db.insert(schema.chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (error) {
    console.error(error);
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    const deleted = await db.transaction(async (tx) => {
      await tx.delete(schema.vote).where(eq(schema.vote.chatId, id));
      await tx.delete(schema.message).where(eq(schema.message.chatId, id));
      await tx.delete(schema.stream).where(eq(schema.stream.chatId, id));
      const [chatRow] = await tx
        .delete(schema.chat)
        .where(eq(schema.chat.id, id))
        .returning();
      return chatRow;
    });
    return deleted;
  } catch (error) {
    console.error(error);
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const { db, schema } = await getCtx();
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<unknown>) =>
      db
        .select()
        .from(schema.chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(schema.chat.userId, id))
            : eq(schema.chat.userId, id)
        )
        .orderBy(desc(schema.chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(schema.chat)
        .where(eq(schema.chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(
        gt(schema.chat.createdAt, selectedChat.createdAt)
      );
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(schema.chat)
        .where(eq(schema.chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(
        lt(schema.chat.createdAt, selectedChat.createdAt)
      );
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    const [selectedChat] = await db
      .select()
      .from(schema.chat)
      .where(eq(schema.chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    const { db, schema } = await getCtx();
    return await db.insert(schema.message).values(messages);
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .select()
      .from(schema.message)
      .where(eq(schema.message.chatId, id))
      .orderBy(asc(schema.message.createdAt));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const { db, schema } = await getCtx();
    const [existingVote] = await db
      .select()
      .from(schema.vote)
      .where(and(eq(schema.vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(schema.vote)
        .set({ isUpvoted: type === "up" })
        .where(
          and(
            eq(schema.vote.messageId, messageId),
            eq(schema.vote.chatId, chatId)
          )
        );
    }
    return await db.insert(schema.vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .select()
      .from(schema.vote)
      .where(eq(schema.vote.chatId, id));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: any;
  content: string;
  userId: string;
}) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .insert(schema.document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    const documents = await db
      .select()
      .from(schema.document)
      .where(eq(schema.document.id, id))
      .orderBy(asc(schema.document.createdAt));

    return documents;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    const [selectedDocument] = await db
      .select()
      .from(schema.document)
      .where(eq(schema.document.id, id))
      .orderBy(desc(schema.document.createdAt));

    return selectedDocument;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    const { db, schema } = await getCtx();
    await db
      .delete(schema.suggestion)
      .where(
        and(
          eq(schema.suggestion.documentId, id),
          gt(schema.suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(schema.document)
      .where(
        and(
          eq(schema.document.id, id),
          gt(schema.document.createdAt, timestamp)
        )
      )
      .returning();
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    const { db, schema } = await getCtx();
    return await db.insert(schema.suggestion).values(suggestions);
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .select()
      .from(schema.suggestion)
      .where(and(eq(schema.suggestion.documentId, documentId)));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .select()
      .from(schema.message)
      .where(eq(schema.message.id, id));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const { db, schema } = await getCtx();
    const messagesToDelete = await db
      .select({ id: schema.message.id })
      .from(schema.message)
      .where(
        and(
          eq(schema.message.chatId, chatId),
          gte(schema.message.createdAt, timestamp)
        )
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(schema.vote)
        .where(
          and(
            eq(schema.vote.chatId, chatId),
            inArray(schema.vote.messageId, messageIds)
          )
        );

      return await db
        .delete(schema.message)
        .where(
          and(
            eq(schema.message.chatId, chatId),
            inArray(schema.message.id, messageIds)
          )
        );
    }
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .update(schema.chat)
      .set({ visibility })
      .where(eq(schema.chat.id, chatId));
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  // Store merged server-enriched usage object
  context: AppUsage;
}) {
  try {
    const { db, schema } = await getCtx();
    return await db
      .update(schema.chat)
      .set({ lastContext: context })
      .where(eq(schema.chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const { db, schema } = await getCtx();
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(schema.message.id) })
      .from(schema.message)
      .innerJoin(schema.chat, eq(schema.message.chatId, schema.chat.id))
      .where(
        and(
          eq(schema.chat.userId, id),
          gte(schema.message.createdAt, twentyFourHoursAgo),
          eq(schema.message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    const { db, schema } = await getCtx();
    await db
      .insert(schema.stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const { db, schema } = await getCtx();
    const streamIds = await db
      .select({ id: schema.stream.id })
      .from(schema.stream)
      .where(eq(schema.stream.chatId, chatId))
      .orderBy(asc(schema.stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}
