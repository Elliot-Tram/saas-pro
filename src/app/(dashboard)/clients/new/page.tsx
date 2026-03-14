import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewClientForm } from "./NewClientForm";

export default async function NewClientPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Get distinct sectors for the dropdown
  const clients = await prisma.client.findMany({
    where: { teamId: session.teamId, sector: { not: null } },
    select: { sector: true },
    distinct: ["sector"],
    orderBy: { sector: "asc" },
  });

  const sectors = clients.map((c) => c.sector).filter(Boolean) as string[];

  return <NewClientForm sectors={sectors} />;
}
