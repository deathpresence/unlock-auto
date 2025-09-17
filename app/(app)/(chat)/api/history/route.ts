import { getChatsByUserId } from "@/db/tenant/queries";
import { requireActiveOrgSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await requireActiveOrgSession();

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 20);
  const startingAfter = searchParams.get("starting_after");
  const endingBefore = searchParams.get("ending_before");

  const result = await getChatsByUserId({
    id: session.userId,
    limit,
    startingAfter,
    endingBefore,
  });

  return Response.json(result);
}
