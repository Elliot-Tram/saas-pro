import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  Euro,
  Users,
  Calendar,
  FileText,
  ArrowUpRight,
  Clock,
  Plus,
  ClipboardCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { CompleteAndCertifyButton } from "@/components/workflow/CompleteAndCertifyButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Check if user has completed basic onboarding
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { company: true },
  });
  const needsOnboarding = !currentUser?.company;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [
    clientCount,
    appointmentsThisMonth,
    todayAppointments,
    upcomingAppointments,
    invoicesThisMonth,
    overdueInvoices,
    recentClients,
  ] = await Promise.all([
    prisma.client.count({ where: { userId: session.userId } }),
    prisma.appointment.count({
      where: { userId: session.userId, date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.appointment.findMany({
      where: { userId: session.userId, date: { gte: startOfDay, lte: endOfDay } },
      include: { client: true },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.findMany({
      where: { userId: session.userId, date: { gt: endOfDay }, status: "scheduled" },
      include: { client: true },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: { userId: session.userId, date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.invoice.findMany({
      where: {
        userId: session.userId,
        status: "sent",
        dueDate: { lt: now },
      },
      include: { client: true },
      orderBy: { dueDate: "asc" },
      take: 5,
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
    { label: "Clients", value: clientCount.toString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "RDV ce mois", value: appointmentsThisMonth.toString(), icon: Calendar, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "En attente", value: formatCurrency(pendingAmount), icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "CA du mois", value: formatCurrency(caThisMonth), icon: Euro, color: "text-green-600", bg: "bg-green-50" },
  ];

  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));

  return (
    <>
      <Header title="Tableau de bord" description="Vue d'ensemble de votre activité">
        <div className="flex items-center gap-2">
          <Link href="/certificates/new">
            <Button size="sm" variant="secondary">
              <ClipboardCheck className="h-4 w-4" />
              Certificat
            </Button>
          </Link>
          <Link href="/clients/new">
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" />
              Client
            </Button>
          </Link>
          <Link href="/calendar">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              RDV
            </Button>
          </Link>
        </div>
      </Header>

      {/* Onboarding banner */}
      {needsOnboarding && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-800">
            Completez votre profil pour commencer
          </p>
          <Link href="/onboarding">
            <Button size="sm" variant="secondary">
              Completer mon profil
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Overdue Invoices Alert */}
      {overdueInvoices.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
            <h3 className="font-semibold text-red-800">
              {overdueInvoices.length} facture{overdueInvoices.length > 1 ? "s" : ""} en retard
            </h3>
          </div>
          <ul className="space-y-2">
            {overdueInvoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between">
                <Link href={`/invoices/${inv.id}`} className="text-sm text-red-700 hover:text-red-900 font-medium">
                  {inv.number} — {inv.client.firstName} {inv.client.lastName}
                </Link>
                <span className="text-sm font-bold text-red-700">{formatCurrency(inv.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MA JOURNÉE */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-4.5 w-4.5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Ma journée</h2>
            <span className="text-sm text-gray-400">
              {new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(now)}
            </span>
            <Badge variant="info">{todayAppointments.length} RDV</Badge>
          </div>
          <Link href="/calendar" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Planning <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardContent className="p-0">
          {todayAppointments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-gray-500 mb-3">Aucun rendez-vous aujourd&apos;hui</p>
              <Link href="/calendar">
                <Button size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                  Planifier un RDV
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {todayAppointments.map((apt) => {
                const isCompleted = apt.status === "completed";
                const isCancelled = apt.status === "cancelled";
                return (
                  <li key={apt.id} className={`px-6 py-4 flex items-center justify-between ${isCompleted ? "opacity-60" : ""}`}>
                    <div className="flex items-center gap-4">
                      {/* Time */}
                      <div className="text-center min-w-[52px]">
                        <p className="text-lg font-bold text-gray-900">{formatTime(apt.date)}</p>
                        <p className="text-xs text-gray-400">{formatTime(apt.endDate)}</p>
                      </div>
                      {/* Divider */}
                      <div className={`w-1 h-12 rounded-full ${isCompleted ? "bg-green-400" : isCancelled ? "bg-red-300" : "bg-blue-500"}`} />
                      {/* Details */}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {apt.title}
                          {isCompleted && <CheckCircle2 className="inline h-3.5 w-3.5 text-green-600 ml-1.5" />}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <p className="text-sm text-gray-500">
                            {apt.client.firstName} {apt.client.lastName}
                          </p>
                          {apt.client.address && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {apt.client.city || apt.client.address}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                            {session?.name?.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Quick actions */}
                    {!isCompleted && !isCancelled && (
                      <div className="flex items-center gap-2">
                        <CompleteAndCertifyButton
                          appointmentId={apt.id}
                          clientId={apt.clientId}
                        />
                        <Link href={`/clients/${apt.clientId}`}>
                          <Button size="sm" variant="ghost">Fiche</Button>
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Two columns: Upcoming + Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {formatDateTime(apt.date)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

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
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        {client.firstName[0]}{client.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{client.city || client.address}</p>
                      </div>
                    </Link>
                    {client.chimneyType && <Badge variant="info">{client.chimneyType}</Badge>}
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
