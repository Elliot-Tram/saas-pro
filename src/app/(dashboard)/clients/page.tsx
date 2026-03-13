import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Users, Plus, Eye, Phone, MapPin, Filter, Upload } from "lucide-react";
import Link from "next/link";

interface ClientsPageProps {
  searchParams: Promise<{ sector?: string }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sector: sectorFilter } = await searchParams;

  const allClients = await prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: { lastName: "asc" },
  });

  // Collect unique sectors for the filter dropdown
  const sectors = Array.from(
    new Set(allClients.map((c) => c.sector).filter(Boolean))
  ).sort() as string[];

  // Apply sector filter if set
  const clients = sectorFilter
    ? allClients.filter((c) => c.sector === sectorFilter)
    : allClients;

  return (
    <>
      <Header title="Clients" description="Gérez votre fichier client">
        <Link href="/clients/import">
          <Button variant="secondary">
            <Upload className="h-4 w-4" />
            Importer
          </Button>
        </Link>
        <Link href="/clients/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau client
          </Button>
        </Link>
      </Header>

      {sectors.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <form className="flex items-center gap-2">
            <select
              name="sector"
              defaultValue={sectorFilter || ""}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Tous les secteurs</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <Button type="submit" variant="secondary" size="sm">
              Filtrer
            </Button>
            {sectorFilter && (
              <Link href="/clients" className="text-xs text-gray-500 hover:text-gray-700">
                Réinitialiser
              </Link>
            )}
          </form>
        </div>
      )}

      {clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Aucun client"
            description="Commencez par ajouter votre premier client pour gérer vos interventions."
            actionLabel="Ajouter un client"
            actionHref="/clients/new"
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
                    Secteur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type cheminée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier passage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((client) => (
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
                        <div>
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {client.lastName} {client.firstName}
                          </p>
                          {client.email && (
                            <p className="text-xs text-gray-500">
                              {client.email}
                            </p>
                          )}
                        </div>
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
                      {client.sector ? (
                        <Badge variant="success">{client.sector}</Badge>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {client.phone ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {client.phone}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
                    <td className="px-6 py-4 text-right">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
