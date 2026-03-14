import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewContractForm } from "./NewContractForm";

export default async function NewContractPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { teamId: session.teamId },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  const clientsData = clients.map((c) => ({
    id: c.id,
    name: `${c.lastName} ${c.firstName}`,
  }));

  return <NewContractForm clients={clientsData} />;
}
