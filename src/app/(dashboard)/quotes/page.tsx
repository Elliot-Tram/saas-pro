import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, Plus, Eye } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" | "info" }> = {
  draft: { label: "Brouillon", variant: "default" },
  sent: { label: "Envoyé", variant: "warning" },
  accepted: { label: "Accepté", variant: "success" },
  rejected: { label: "Refusé", variant: "danger" },
};

export default async function QuotesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const quotes = await prisma.quote.findMany({
    where: { teamId: session.teamId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Devis" description="Gérez vos devis clients">
        <Link href="/quotes/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau devis
          </Button>
        </Link>
      </Header>

      {quotes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={FileText}
              title="Aucun devis"
              description="Créez votre premier devis pour commencer à proposer vos services."
              actionLabel="Créer un devis"
              actionHref="/quotes/new"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map((quote) => {
                  const config = statusConfig[quote.status] || statusConfig.draft;
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{quote.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {quote.client.firstName} {quote.client.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(quote.date)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(quote.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/quotes/${quote.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        </Link>
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
