import { headers } from "next/headers";
import { ChatSDKError } from "@/lib/errors";
import { getSuggestionsByDocumentId } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");

  if (!documentId) {
    return new ChatSDKError(
      "bad_request:api",
      "Parameter documentId is required."
    ).toResponse();
  }

  const session = await requireActiveOrgSession();

  const suggestions = await getSuggestionsByDocumentId({ documentId });
  const [first] = suggestions;

  if (!first) {
    return Response.json([], { status: 200 });
  }

  // Ensure resource ownership
  if (first.userId !== session.userId) {
    return new ChatSDKError("forbidden:api").toResponse();
  }

  return Response.json(suggestions, { status: 200 });
}


