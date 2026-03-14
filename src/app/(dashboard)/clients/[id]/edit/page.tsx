import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { EditClientForm } from "./EditClientForm";

interface EditClientPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [client, sectorClients] = await Promise.all([
    prisma.client.findFirst({ where: { id, teamId: session.teamId } }),
    prisma.client.findMany({
      where: { teamId: session.teamId, sector: { not: null } },
      select: { sector: true },
      distinct: ["sector"],
      orderBy: { sector: "asc" },
    }),
  ]);

  if (!client) notFound();

  const sectors = sectorClients.map((c) => c.sector).filter(Boolean) as string[];

  return <EditClientForm client={client} sectors={sectors} />;
}
