import { OrganizationOnboarding } from "@/components/organization-onboarding";
import { requireSession } from "@/lib/session";

export default async function OnboardingPage() {
  await requireSession();
  return <OrganizationOnboarding />;
}
