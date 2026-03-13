import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
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
  });

  if (!user) redirect("/login");

  return (
    <>
      <Header title="Paramètres" description="Gérez les informations de votre entreprise" />
      <SettingsForm user={user} />
    </>
  );
}
