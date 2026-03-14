import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewCertificateForm } from "./NewCertificateForm";

interface NewCertificatePageProps {
  searchParams: Promise<{ clientId?: string; fromWorkflow?: string }>;
}

export default async function NewCertificatePage({
  searchParams,
}: NewCertificatePageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { clientId, fromWorkflow } = await searchParams;

  const clients = await prisma.client.findMany({
    where: { teamId: session.teamId },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      chimneyType: true,
      fuelType: true,
    },
  });

  const clientsData = clients.map((c) => ({
    id: c.id,
    name: `${c.lastName} ${c.firstName}`,
    chimneyType: c.chimneyType,
    fuelType: c.fuelType,
  }));

  return (
    <NewCertificateForm
      clients={clientsData}
      defaultClientId={clientId}
      fromWorkflow={fromWorkflow === "true"}
    />
  );
}
