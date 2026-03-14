import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { MapPin, Users, AlertTriangle, CalendarPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SectorDetailPageProps {
  params: Promise<{ sector: string }>;
}

export default async function SectorDetailPage({ params }: SectorDetailPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sector } = await params;
  const sectorName = decodeURIComponent(sector);

  const clients = await prisma.client.findMany({
    where: {
      teamId: session.teamId,
      sector: sectorName,
    },
    orderBy: { lastName: "asc" },
  });

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const dueCount = clients.filter(
    (c) => !c.lastVisit || c.lastVisit < elevenMonthsAgo
  ).length;

  const lastVisited = clients
    .filter((c) => c.lastVisit)
    .sort((a, b) => b.lastVisit!.getTime() - a.lastVisit!.getTime())[0];

  function getStatus(client: { lastVisit: Date | null }) {
    if (!client.lastVisit || client.lastVisit < elevenMonthsAgo) {
      return { label: "À relancer", variant: "warning" as const };
    }
    return { label: "À jour", variant: "success" as const };
  }

  return (
    <>
      <Header title={sectorName} description={`Secteur — ${clients.length} client${clients.length > 1 ? "s" : ""}`}>
        <Link href="/sectors">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </Link>
        <Link href={`/calendar?sector=${encodeURIComponent(sectorName)}`}>
          <Button>
            <CalendarPlus className="h-4 w-4" />
            Créer une tournée
          </Button>
        </Link>
      </Header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total clients</p>
              <p className="text-xl font-semibold text-gray-900">{clients.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">À relancer</p>
              <p className="text-xl font-semibold text-gray-900">{dueCount}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="px-6 py-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dernier passage</p>
              <p className="text-xl font-semibold text-gray-900">
                {lastVisited?.lastVisit ? formatDate(lastVisited.lastVisit) : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Client table */}
      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Aucun client dans ce secteur"
            description="Assignez des clients à ce secteur depuis leur fiche."
            actionLabel="Voir les clients"
            actionHref="/clients"
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type cheminée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier passage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => {
                  const status = getStatus(client);
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {client.lastName} {client.firstName}
                          </p>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {client.address}
                            {client.city && `, ${client.city}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.chimneyType ? (
                          <Badge variant="info">{client.chimneyType}</Badge>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {client.lastVisit ? (
                          <span className="text-sm text-gray-600">
                            {formatDate(client.lastVisit)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Jamais</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
