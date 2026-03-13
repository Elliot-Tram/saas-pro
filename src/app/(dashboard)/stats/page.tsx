import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Euro,
  Users,
  Calendar,
  TrendingUp,
  Award,
  ClipboardCheck,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const ANOMALY_LABELS: Record<string, string> = {
  anomaly_distance_plancher: "Distance de sécurité plancher non conforme",
  anomaly_distance_toiture: "Distance de sécurité toiture non conforme",
  anomaly_etancheite: "Défaut d'étanchéité du conduit",
  anomaly_coudes: "Coudes non conformes",
  anomaly_souche: "Souche de cheminée défectueuse",
  anomaly_section_horizontale: "Section horizontale excessive",
  anomaly_plaque: "Absence de plaque signalétique",
  anomaly_bistre: "Présence de bistre importante",
  anomaly_autre: "Autre anomalie",
};

const CONDITION_LABELS: Record<string, string> = {
  bon_etat: "Bon état",
  a_surveiller: "À surveiller",
  dangereux: "Dangereux",
};

const CONDITION_VARIANTS: Record<string, "success" | "warning" | "danger"> = {
  bon_etat: "success",
  a_surveiller: "warning",
  dangereux: "danger",
};

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
];

type Period = "month" | "quarter" | "year";

function getPeriodDates(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();

  switch (period) {
    case "quarter": {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      return {
        start: new Date(now.getFullYear(), quarterMonth, 1),
        end: new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59),
        label: `T${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`,
      };
    }
    case "year":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
        label: `${now.getFullYear()}`,
      };
    case "month":
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        label: `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`,
      };
  }
}

function getLast6MonthsRange(): { start: Date; months: { year: number; month: number; label: string }[] } {
  const now = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: MONTH_NAMES[d.getMonth()].slice(0, 3),
    });
  }
  const start = new Date(months[0].year, months[0].month, 1);
  return { start, months };
}

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { period: periodParam } = await searchParams;

  const period: Period =
    periodParam === "quarter" ? "quarter" :
    periodParam === "year" ? "year" :
    "month";

  const { start: periodStart, end: periodEnd, label: periodLabel } = getPeriodDates(period);
  const { start: sixMonthsStart, months: last6Months } = getLast6MonthsRange();

  // Fetch all data in parallel
  const [
    paidInvoicesPeriod,
    invoicesLast6Months,
    completedAppointmentsPeriod,
    allAppointmentsPeriod,
    totalClients,
    newClientsPeriod,
    clientsWithActiveContracts,
    clientsWithSectors,
    certificatesPeriod,
    topClientsData,
  ] = await Promise.all([
    // Revenue for the period (paid invoices)
    prisma.invoice.findMany({
      where: {
        userId: session.userId,
        status: "paid",
        date: { gte: periodStart, lte: periodEnd },
      },
    }),
    // Revenue last 6 months (paid invoices)
    prisma.invoice.findMany({
      where: {
        userId: session.userId,
        status: "paid",
        date: { gte: sixMonthsStart },
      },
    }),
    // Completed appointments for the period
    prisma.appointment.count({
      where: {
        userId: session.userId,
        status: "completed",
        date: { gte: periodStart, lte: periodEnd },
      },
    }),
    // All appointments for the period (for day-of-week analysis)
    prisma.appointment.findMany({
      where: {
        userId: session.userId,
        status: "completed",
        date: { gte: periodStart, lte: periodEnd },
      },
      select: { date: true },
    }),
    // Total clients
    prisma.client.count({
      where: { userId: session.userId },
    }),
    // New clients this period
    prisma.client.count({
      where: {
        userId: session.userId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
    }),
    // Clients with active contracts
    prisma.contract.findMany({
      where: {
        userId: session.userId,
        status: "active",
      },
      select: { clientId: true },
      distinct: ["clientId"],
    }),
    // Clients with sectors + their invoices and appointments for sector performance
    prisma.client.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        sector: true,
        invoices: {
          where: { status: "paid" },
          select: { total: true },
        },
        appointments: {
          where: { status: "completed" },
          select: { id: true },
        },
      },
    }),
    // Certificates for the period
    prisma.certificate.findMany({
      where: {
        userId: session.userId,
        date: { gte: periodStart, lte: periodEnd },
      },
      select: { condition: true, anomalies: true },
    }),
    // Top clients by total invoiced
    prisma.client.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastVisit: true,
        invoices: {
          where: { status: "paid" },
          select: { total: true },
        },
        appointments: {
          where: { status: "completed" },
          select: { id: true },
        },
      },
    }),
  ]);

  // --- Compute revenue ---
  const totalCA = paidInvoicesPeriod.reduce((sum, inv) => sum + inv.total, 0);

  // --- Monthly CA for bar chart ---
  const monthlyCA = last6Months.map((m) => {
    const monthTotal = invoicesLast6Months
      .filter((inv) => {
        const d = new Date(inv.date);
        return d.getFullYear() === m.year && d.getMonth() === m.month;
      })
      .reduce((sum, inv) => sum + inv.total, 0);
    return { ...m, total: monthTotal };
  });
  const maxMonthlyCA = Math.max(...monthlyCA.map((m) => m.total), 1);

  // --- Activity stats ---
  const weeksInPeriod = Math.max(
    1,
    Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  );
  const avgPerWeek = (completedAppointmentsPeriod / weeksInPeriod).toFixed(1);

  // Most active day of week
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  allAppointmentsPeriod.forEach((apt) => {
    dayCounts[new Date(apt.date).getDay()]++;
  });
  const mostActiveDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  const mostActiveDay = allAppointmentsPeriod.length > 0 ? DAY_NAMES[mostActiveDayIndex] : "—";

  // --- Sector performance ---
  const sectorMap = new Map<string, { name: string; clients: number; interventions: number; ca: number }>();
  clientsWithSectors.forEach((client) => {
    const sectorName = client.sector || "Sans secteur";
    const existing = sectorMap.get(sectorName) || { name: sectorName, clients: 0, interventions: 0, ca: 0 };
    existing.clients++;
    existing.interventions += client.appointments.length;
    existing.ca += client.invoices.reduce((sum, inv) => sum + inv.total, 0);
    sectorMap.set(sectorName, existing);
  });
  const sectorPerformance = Array.from(sectorMap.values())
    .sort((a, b) => b.ca - a.ca);

  // --- Top clients ---
  const topClients = topClientsData
    .map((client) => ({
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      totalInvoiced: client.invoices.reduce((sum, inv) => sum + inv.total, 0),
      interventions: client.appointments.length,
      lastVisit: client.lastVisit,
    }))
    .filter((c) => c.totalInvoiced > 0)
    .sort((a, b) => b.totalInvoiced - a.totalInvoiced)
    .slice(0, 5);

  // --- Certificate stats ---
  const conditionCounts: Record<string, number> = { bon_etat: 0, a_surveiller: 0, dangereux: 0 };
  const anomalyCounts = new Map<string, number>();

  certificatesPeriod.forEach((cert) => {
    if (cert.condition in conditionCounts) {
      conditionCounts[cert.condition]++;
    }
    const anomalies = (cert.anomalies as string[] | null) || [];
    anomalies.forEach((a) => {
      anomalyCounts.set(a, (anomalyCounts.get(a) || 0) + 1);
    });
  });

  const topAnomalies = Array.from(anomalyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const periods = [
    { key: "month", label: "Ce mois" },
    { key: "quarter", label: "Ce trimestre" },
    { key: "year", label: "Cette année" },
  ];

  return (
    <>
      <Header title="Statistiques" description="Analyse détaillée de votre activité" />

      {/* Period selector */}
      <div className="flex items-center gap-2 mb-8">
        {periods.map((p) => (
          <Link key={p.key} href={`/stats?period=${p.key}`}>
            <Button
              variant={period === p.key ? "primary" : "secondary"}
              size="sm"
            >
              {p.label}
            </Button>
          </Link>
        ))}
        <span className="ml-3 text-sm text-gray-500">{periodLabel}</span>
      </div>

      {/* Revenue Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Euro className="h-4.5 w-4.5 text-green-600" />
            <h2 className="font-semibold text-gray-900">Chiffre d&apos;affaires</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-900 mb-6">{formatCurrency(totalCA)}</p>

          {/* Bar chart - last 6 months */}
          <div className="space-y-3">
            {monthlyCA.map((m) => {
              const widthPercent = maxMonthlyCA > 0 ? (m.total / maxMonthlyCA) * 100 : 0;
              return (
                <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-10 shrink-0">{m.label}</span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-md overflow-hidden">
                    {m.total > 0 && (
                      <div
                        className="h-full bg-green-500 rounded-md transition-all"
                        style={{ width: `${Math.max(widthPercent, 2)}%` }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-24 text-right shrink-0">
                    {formatCurrency(m.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Activity section - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Interventions card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-purple-600" />
              <h2 className="font-semibold text-gray-900">Interventions</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total réalisées</p>
                <p className="text-2xl font-bold text-gray-900">{completedAppointmentsPeriod}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Moyenne / semaine</p>
                  <p className="text-lg font-semibold text-gray-900">{avgPerWeek}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jour le plus actif</p>
                  <p className="text-lg font-semibold text-gray-900">{mostActiveDay}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Clients</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total clients</p>
                <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nouveaux cette période</p>
                  <p className="text-lg font-semibold text-gray-900">{newClientsPeriod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avec contrat actif</p>
                  <p className="text-lg font-semibold text-gray-900">{clientsWithActiveContracts.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector performance */}
      {sectorPerformance.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-amber-600" />
              <h2 className="font-semibold text-gray-900">Performance par secteur</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">Secteur</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Clients</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Interventions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">CA</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-500">CA moy. / client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sectorPerformance.map((sector) => (
                    <tr key={sector.name} className="hover:bg-gray-50">
                      <td className="py-3 px-6 font-medium text-gray-900">{sector.name}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{sector.clients}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{sector.interventions}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(sector.ca)}
                      </td>
                      <td className="py-3 px-6 text-right text-gray-700">
                        {formatCurrency(sector.clients > 0 ? sector.ca / sector.clients : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top clients */}
      {topClients.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-yellow-600" />
              <h2 className="font-semibold text-gray-900">Top clients</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-6 font-medium text-gray-500">Client</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Total facturé</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Interventions</th>
                    <th className="text-right py-3 px-6 font-medium text-gray-500">Dernière visite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topClients.map((client, index) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="py-3 px-6">
                        <Link
                          href={`/clients/${client.id}`}
                          className="flex items-center gap-3 hover:text-blue-600"
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">{client.name}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(client.totalInvoiced)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{client.interventions}</td>
                      <td className="py-3 px-6 text-right text-gray-500">
                        {client.lastVisit ? formatDate(client.lastVisit) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate stats */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4.5 w-4.5 text-teal-600" />
            <h2 className="font-semibold text-gray-900">Certificats</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-sm text-gray-500">Total cette période</p>
            <p className="text-2xl font-bold text-gray-900">{certificatesPeriod.length}</p>
          </div>

          {/* Condition breakdown */}
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(conditionCounts).map(([condition, count]) => (
              <Badge
                key={condition}
                variant={CONDITION_VARIANTS[condition] || "default"}
                className="text-sm px-3 py-1"
              >
                {CONDITION_LABELS[condition] || condition}: {count}
              </Badge>
            ))}
          </div>

          {/* Most common anomalies */}
          {topAnomalies.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Anomalies les plus fréquentes</p>
              <ul className="space-y-2">
                {topAnomalies.map(([anomaly, count]) => (
                  <li key={anomaly} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{ANOMALY_LABELS[anomaly] || anomaly}</span>
                    <Badge variant="danger">{count}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {certificatesPeriod.length === 0 && topAnomalies.length === 0 && (
            <p className="text-sm text-gray-500">Aucun certificat sur cette période</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
