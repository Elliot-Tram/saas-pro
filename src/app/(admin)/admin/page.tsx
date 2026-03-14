import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import {
  Building2,
  Users,
  ClipboardCheck,
  FileText,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

  // Global stats
  const [totalTeams, totalUsers, totalCertificates, totalInvoices] =
    await Promise.all([
      prisma.team.count(),
      prisma.user.count(),
      prisma.certificate.count(),
      prisma.invoice.count(),
    ]);

  // All teams with counts
  const teams = await prisma.team.findMany({
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
    },
  });

  const stats = [
    {
      label: "Entreprises",
      value: totalTeams.toString(),
      icon: Building2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Utilisateurs",
      value: totalUsers.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Certificats",
      value: totalCertificates.toString(),
      icon: ClipboardCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Factures",
      value: totalInvoices.toString(),
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
          <h1 className="text-2xl font-bold text-gray-900">
            Administration
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion globale des comptes et entreprises
          </p>
        </div>
        <Link href="/admin/create">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Creer un compte prospect
          </Button>
        </Link>
      </div>

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

      {/* Teams Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Toutes les entreprises ({teams.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 font-medium text-gray-500">
                  Entreprise
                </th>
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
                  Inscrit le
                </th>
                <th className="px-6 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50 transition-colors">
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
              ))}
              {teams.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
    </>
  );
}
