import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [team, user] = await Promise.all([
    prisma.team.findUnique({
      where: { id: session.teamId },
      select: {
        id: true,
        company: true,
        phone: true,
        siret: true,
        address: true,
        city: true,
        postalCode: true,
        logo: true,
        insuranceNumber: true,
        insurerName: true,
        qualification: true,
        googleReviewLink: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
      },
    }),
  ]);

  if (!team || !user) redirect("/login");

  return (
    <>
      <Header title="Paramètres" description="Gérez les informations de votre entreprise" />
      <SettingsForm team={team} user={user} />
    </>
  );
}
