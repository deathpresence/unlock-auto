import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSessionOrNull() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session ?? null;
  } catch (_error) {
    return null;
  }
}

export async function requireSession() {
  const session = await getSessionOrNull();
  if (!session) {
    redirect("/login");
  }
  return session;
}
