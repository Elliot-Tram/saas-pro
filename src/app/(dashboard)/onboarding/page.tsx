import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Check if user has already completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { company: true, siret: true },
  });

  if (user?.company && user?.siret) {
    redirect("/");
  }

  return <OnboardingWizard />;
}
