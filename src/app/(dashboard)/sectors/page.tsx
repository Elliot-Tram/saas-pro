import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MapPin, Users, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function SectorsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: { lastName: "asc" },
  });

  // Group clients by sector
  const sectorMap = new Map<string, typeof clients>();
  const unassigned: typeof clients = [];

  for (const client of clients) {
    if (client.sector) {
      const list = sectorMap.get(client.sector) || [];
      list.push(client);
      sectorMap.set(client.sector, list);
    } else {
      unassigned.push(client);
    }
  }

  const sectors = Array.from(sectorMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b, "fr")
  );

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  function countDue(sectorClients: typeof clients) {
    return sectorClients.filter(
      (c) => !c.lastVisit || c.lastVisit < elevenMonthsAgo
    ).length;
  }

  return (
    <>
      <Header
        title="Secteurs"
        description="Organisez vos tournées par zone géographique"
      />

      {sectors.length === 0 && unassigned.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Aucun secteur"
            description="Assignez des secteurs à vos clients pour organiser vos tournées."
            actionLabel="Voir les clients"
            actionHref="/clients"
          />
        </Card>
      ) : (
        <>
          {sectors.length === 0 ? (
            <Card>
              <EmptyState
                icon={MapPin}
                title="Aucun secteur défini"
                description="Assignez des secteurs à vos clients pour organiser vos tournées par zone géographique."
                actionLabel="Voir les clients"
                actionHref="/clients"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {sectors.map(([sectorName, sectorClients]) => {
                const dueCount = countDue(sectorClients);
                return (
                  <Card key={sectorName}>
                    <CardContent className="py-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <MapPin className="h-4.5 w-4.5 text-blue-600" />
                          </div>
                          <h3 className="text-base font-semibold text-gray-900">
                            {sectorName}
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            Clients
                          </span>
                          <span className="font-medium text-gray-900">
                            {sectorClients.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            À relancer
                          </span>
                          <span>
                            {dueCount > 0 ? (
                              <Badge variant="warning">{dueCount}</Badge>
                            ) : (
                              <Badge variant="success">0</Badge>
                            )}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/sectors/${encodeURIComponent(sectorName)}`}
                      >
                        <Button variant="secondary" className="w-full">
                          <MapPin className="h-4 w-4" />
                          Planifier une tournée
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {unassigned.length > 0 && (
            <Card>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Clients sans secteur
                    </h3>
                    <p className="text-sm text-gray-500">
                      {unassigned.length} client{unassigned.length > 1 ? "s" : ""} sans secteur assigné.
                      Modifiez leur fiche pour les ajouter à un secteur.
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {unassigned.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {client.lastName} {client.firstName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {client.address}
                            {client.city && `, ${client.city}`}
                          </p>
                        </div>
                      </div>
                      <Link href={`/clients/${client.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Assigner
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </>
  );
}
