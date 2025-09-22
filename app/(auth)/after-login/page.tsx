import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";

export default async function AfterLoginPage() {
  const { session } = await requireSession();
  try {
    const hdrs = await headers();
    const orgsResponse: any = await auth.api.listOrganizations({ headers: hdrs });
    const organizations = Array.isArray(orgsResponse)
      ? orgsResponse
      : orgsResponse?.data ?? [];
    if (!session.activeOrganizationId && organizations[0]?.id) {
      try {
        await auth.api.setActiveOrganization({
          body: { organizationId: organizations[0].id },
          headers: hdrs,
        });
      } catch (_) {}
    }
  } catch (_) {}

  redirect("/");
}


