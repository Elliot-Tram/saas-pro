import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Check if team has already completed onboarding
  const team = await prisma.team.findUnique({
    where: { id: session.teamId },
    select: { company: true, siret: true, phone: true, address: true, city: true, postalCode: true },
  });

  if (team?.company && team?.siret) {
    redirect("/");
  }

  return <OnboardingWizard defaultValues={{
    company: team?.company || "",
    siret: team?.siret || "",
    phone: team?.phone || "",
    address: team?.address || "",
    city: team?.city || "",
    postalCode: team?.postalCode || "",
  }} />;
}
