import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProspectRow } from "@/components/admin/ProspectRow";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Users,
  Phone,
  ThumbsUp,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

export default async function ProspectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

  const prospects = await prisma.prospect.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  // Sort by status priority
  const statusOrder: Record<string, number> = {
    a_contacter: 0,
    appele: 1,
    interesse: 2,
    compte_cree: 3,
    pas_interesse: 4,
  };

  const sorted = [...prospects].sort(
    (a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
  );

  const total = prospects.length;
  const aContacter = prospects.filter((p) => p.status === "a_contacter").length;
  const appele = prospects.filter((p) => p.status === "appele").length;
  const interesse = prospects.filter((p) => p.status === "interesse").length;
  const compteCree = prospects.filter((p) => p.status === "compte_cree").length;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: Users,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    {
      label: "A contacter",
      value: aContacter,
      icon: Phone,
      color: "text-gray-600",
      bg: "bg-gray-50",
    },
    {
      label: "Appeles",
      value: appele,
      icon: Phone,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Interesses",
      value: interesse,
      icon: ThumbsUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Comptes crees",
      value: compteCree,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerez votre pipeline de prospection
            </p>
          </div>
          <Link href="/admin/prospects/import">
            <Button size="sm">
              <Upload className="h-4 w-4" />
              Importer CSV
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Tous les prospects ({total})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">
                  Entreprise
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Ville</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Telephone
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-500">Notes</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map((prospect) => (
                <ProspectRow key={prospect.id} prospect={prospect} />
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <UserPlus className="h-8 w-8 text-gray-300" />
                      <div>
                        <p className="font-medium text-gray-500">
                          Aucun prospect
                        </p>
                        <p className="text-sm mt-1">
                          Importez un fichier CSV pour commencer
                        </p>
                      </div>
                      <Link href="/admin/prospects/import">
                        <Button size="sm" variant="secondary">
                          <Upload className="h-4 w-4" />
                          Importer CSV
                        </Button>
                      </Link>
                    </div>
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
