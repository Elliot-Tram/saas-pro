import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CalendarView } from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [appointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        teamId: session.teamId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { client: true },
      orderBy: { date: "asc" },
    }),
    prisma.client.findMany({
      where: { teamId: session.teamId },
      orderBy: { lastName: "asc" },
    }),
  ]);

  // Serialize dates for client component
  const serializedAppointments = appointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    description: apt.description,
    date: apt.date.toISOString(),
    endDate: apt.endDate.toISOString(),
    status: apt.status,
    clientId: apt.clientId,
    clientName: `${apt.client.firstName} ${apt.client.lastName}`,
  }));

  const serializedClients = clients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
  }));

  return (
    <>
      <Header
        title="Calendrier"
        description="Planifiez et gérez vos rendez-vous"
      />
      <CalendarView
        appointments={serializedAppointments}
        clients={serializedClients}
      />
    </>
  );
}
