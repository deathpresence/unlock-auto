import { requireSession } from "@/lib/session";
import { OrganizationOnboarding } from "@/components/organization-onboarding";

export default async function OnboardingPage() {
  await requireSession();
  return <OrganizationOnboarding />;
}


