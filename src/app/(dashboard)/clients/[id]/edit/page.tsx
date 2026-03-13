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

  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
  });

  if (!client) notFound();

  return <EditClientForm client={client} />;
}
