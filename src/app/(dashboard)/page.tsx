import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Euro,
  Users,
  Calendar,
  FileText,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [clientCount, appointmentsThisMonth, upcomingAppointments, invoicesThisMonth, recentClients] =
    await Promise.all([
      prisma.client.count({ where: { userId: session.userId } }),
      prisma.appointment.count({
        where: {
          userId: session.userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.appointment.findMany({
        where: {
          userId: session.userId,
          date: { gte: now },
          status: "scheduled",
        },
        include: { client: true },
        orderBy: { date: "asc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: {
          userId: session.userId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.client.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const caThisMonth = invoicesThisMonth
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = invoicesThisMonth
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.total, 0);

  const stats = [
    {
      label: "CA du mois",
      value: formatCurrency(caThisMonth),
      icon: Euro,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Clients",
      value: clientCount.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "RDV ce mois",
      value: appointmentsThisMonth.toString(),
      icon: Calendar,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "En attente",
      value: formatCurrency(pendingAmount),
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <>
      <Header title="Tableau de bord" description="Vue d'ensemble de votre activité" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Prochains rendez-vous</h2>
            <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardContent className="p-0">
            {upcomingAppointments.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                Aucun rendez-vous à venir
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {upcomingAppointments.map((apt) => (
                  <li key={apt.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.title}</p>
                      <p className="text-xs text-gray-500">
                        {apt.client.firstName} {apt.client.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(apt.date)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Clients */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Derniers clients</h2>
            <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardContent className="p-0">
            {recentClients.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">
                Aucun client pour le moment
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentClients.map((client) => (
                  <li key={client.id} className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {client.firstName[0]}
                        {client.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{client.city || client.address}</p>
                      </div>
                    </div>
                    {client.chimneyType && (
                      <Badge variant="info">{client.chimneyType}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
