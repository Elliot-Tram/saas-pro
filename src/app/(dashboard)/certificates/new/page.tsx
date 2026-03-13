import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewCertificateForm } from "./NewCertificateForm";

export default async function NewCertificatePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: { lastName: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  return <NewCertificateForm clients={clients} />;
}
