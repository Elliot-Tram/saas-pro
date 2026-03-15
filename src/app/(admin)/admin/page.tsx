import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  Plus,
  Eye,
  TrendingUp,
  Activity,
  UserPlus,
  Target,
  Search,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // All queries in parallel for performance
  const [
    totalTeams,
    totalUsers,
    totalCertificates,
    totalInvoices,
    certificatesThisMonth,
    invoicesThisMonth,
    teamsWithRecentCerts,
    teamsWithRecentInvoices,
    allTeams,
    teamsWithAnyCert,
    totalProspects,
    prospectTeams,
  ] = await Promise.all([
    prisma.team.count(),
    prisma.user.count(),
    prisma.certificate.count(),
    prisma.invoice.count(),
    prisma.certificate.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.invoice.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.certificate
      .findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { teamId: true },
        distinct: ["teamId"],
      })
      .then((r) => new Set(r.map((c) => c.teamId))),
    prisma.invoice
      .findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { teamId: true },
        distinct: ["teamId"],
      })
      .then((r) => new Set(r.map((i) => i.teamId))),
    prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            clients: true,
            certificates: true,
            invoices: true,
          },
        },
        certificates: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    prisma.team.count({
      where: { certificates: { some: {} } },
    }),
    prisma.team.count({
      where: { source: "prospect" },
    }),
    prisma.team.findMany({
      where: { source: "prospect" },
      include: {
        _count: {
          select: {
            certificates: true,
            clients: true,
          },
        },
      },
    }),
  ]);

  // Compute active teams (cert or invoice in last 30 days)
  const activeTeamIds = new Set([
    ...teamsWithRecentCerts,
    ...teamsWithRecentInvoices,
  ]);
  const activeTeamsCount = activeTeamIds.size;

  // MRR calculation: teams × 29€ + extra users × 19€
  const extraUsers = Math.max(0, totalUsers - totalTeams); // 1 user included per team
  const mrr = totalTeams * 29 + extraUsers * 19;
  const arr = mrr * 12;

  // Activation rate: % of teams with at least 1 certificate
  const activationRate =
    totalTeams > 0 ? Math.round((teamsWithAnyCert / totalTeams) * 100) : 0;

  // Monthly signups for last 6 months
  const monthlySignups: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = d.toLocaleDateString("fr-FR", {
      month: "short",
      year: "2-digit",
    });
    const count = allTeams.filter(
      (t) => t.createdAt >= d && t.createdAt < nextMonth
    ).length;
    monthlySignups.push({ label, count });
  }
  const maxSignups = Math.max(...monthlySignups.map((m) => m.count), 1);

  // Team status computation
  function getTeamStatus(team: (typeof allTeams)[number]) {
    const created = new Date(team.createdAt);
    const lastCert = team.certificates[0]?.createdAt;
    const lastInv = team.invoices[0]?.createdAt;
    const lastActivity =
      lastCert && lastInv
        ? new Date(Math.max(lastCert.getTime(), lastInv.getTime()))
        : lastCert || lastInv || null;

    if (now.getTime() - created.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return { label: "Nouvelle", variant: "info" as const };
    }
    if (lastActivity && lastActivity >= sevenDaysAgo) {
      return { label: "Active", variant: "success" as const };
    }
    if (!lastActivity || lastActivity < thirtyDaysAgo) {
      return { label: "Dormante", variant: "danger" as const };
    }
    return { label: "Inactive", variant: "default" as const };
  }

  function getLastActivity(team: (typeof allTeams)[number]): Date | null {
    const lastCert = team.certificates[0]?.createdAt;
    const lastInv = team.invoices[0]?.createdAt;
    if (lastCert && lastInv) {
      return new Date(Math.max(lastCert.getTime(), lastInv.getTime()));
    }
    return lastCert || lastInv || null;
  }

  // Prospect stats
  const prospectsActivated = prospectTeams.filter(
    (t) => t._count.certificates > 0 || t._count.clients > 0
  ).length;
  const prospectsDormant = prospectTeams.filter(
    (t) => t._count.certificates === 0 && t._count.clients === 0
  ).length;

  const stats = [
    {
      label: "MRR estime",
      value: `${mrr.toLocaleString("fr-FR")} €`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Teams actives",
      value: activeTeamsCount.toString(),
      icon: Activity,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total entreprises",
      value: totalTeams.toString(),
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total utilisateurs",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Certificats ce mois",
      value: certificatesThisMonth.toString(),
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Factures ce mois",
      value: invoicesThisMonth.toString(),
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tableau de bord SaaS — vue fondateur
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/prospects">
            <Button size="sm" variant="secondary">
              <Search className="h-4 w-4" />
              Prospects
            </Button>
          </Link>
          <Link href="/admin/create">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Creer un compte prospect
            </Button>
          </Link>
        </div>
      </div>

      {/* Revenue Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardContent className="py-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              MRR estime
            </p>
            <p className="text-4xl font-bold text-emerald-600">
              {mrr.toLocaleString("fr-FR")} €
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {totalTeams} teams x 29€ + {extraUsers} utilisateurs
              supplementaires x 19€
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              ARR estime
            </p>
            <p className="text-4xl font-bold text-emerald-600">
              {arr.toLocaleString("fr-FR")} €
            </p>
            <p className="text-xs text-gray-400 mt-2">MRR x 12 mois</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid — 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
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

      {/* Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Signups Timeline */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-gray-400" />
              Inscriptions par mois
            </h2>
          </div>
          <CardContent>
            <div className="space-y-3">
              {monthlySignups.map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                    {m.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full flex items-center justify-end px-2 transition-all"
                      style={{
                        width: `${Math.max((m.count / maxSignups) * 100, m.count > 0 ? 12 : 0)}%`,
                      }}
                    >
                      {m.count > 0 && (
                        <span className="text-xs font-medium text-white">
                          {m.count}
                        </span>
                      )}
                    </div>
                  </div>
                  {m.count === 0 && (
                    <span className="text-xs text-gray-300">0</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activation Rate */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" />
              Taux d&apos;activation
            </h2>
          </div>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Teams ayant cree au moins 1 certificat
            </p>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-bold text-gray-900">
                {activationRate}%
              </span>
              <span className="text-sm text-gray-400 mb-2">
                {teamsWithAnyCert} / {totalTeams} teams
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  activationRate >= 60
                    ? "bg-green-500"
                    : activationRate >= 30
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${activationRate}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement — Enhanced Teams Table */}
      <Card className="mb-8">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Toutes les entreprises ({allTeams.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 font-medium text-gray-500">
                  Entreprise
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">Statut</th>
                <th className="px-6 py-3 font-medium text-gray-500">Source</th>
                <th className="px-6 py-3 font-medium text-gray-500 text-center">
                  Membres
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-center">
                  Clients
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-center">
                  Certificats
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-center">
                  Factures
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Derniere activite
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Inscrit le
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allTeams.map((team) => {
                const status = getTeamStatus(team);
                const lastAct = getLastActivity(team);
                return (
                  <tr
                    key={team.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {team.company || team.name}
                        </p>
                        {team.city && (
                          <p className="text-xs text-gray-400">{team.city}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          team.source === "prospect" ? "warning" : "default"
                        }
                      >
                        {team.source === "prospect" ? "Prospect" : "Organique"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {team._count.members}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {team._count.clients}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {team._count.certificates}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {team._count.invoices}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {lastAct ? formatDate(lastAct) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(team.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/teams/${team.id}`}>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {allTeams.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Aucune entreprise enregistree
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pipeline Section — Prospects */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Pipeline prospects
          </h2>
        </div>
        <CardContent>
          {/* Prospect summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total prospects crees</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalProspects}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-700">Prospects actives</p>
              <p className="text-2xl font-bold text-green-700">
                {prospectsActivated}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">Prospects dormants</p>
              <p className="text-2xl font-bold text-red-700">
                {prospectsDormant}
              </p>
            </div>
          </div>

          {/* Prospect list */}
          {prospectTeams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-4 py-2 font-medium text-gray-500">
                      Entreprise
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-500 text-center">
                      Clients
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-500 text-center">
                      Certificats
                    </th>
                    <th className="px-4 py-2 font-medium text-gray-500">
                      Statut activation
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prospectTeams.map((pt) => {
                    const activated =
                      pt._count.certificates > 0 || pt._count.clients > 0;
                    return (
                      <tr
                        key={pt.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {pt.company || pt.name}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {pt._count.clients}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-600">
                          {pt._count.certificates}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={activated ? "success" : "danger"}>
                            {activated ? "Active" : "Dormant"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">
              Aucun prospect cree
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
