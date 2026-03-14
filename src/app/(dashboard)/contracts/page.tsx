import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatCurrency } from "@/lib/utils";
import { FileSignature, Plus } from "lucide-react";
import Link from "next/link";

const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  active: { label: "Actif", variant: "success" },
  expired: { label: "Expiré", variant: "warning" },
  cancelled: { label: "Résilié", variant: "danger" },
};

export default async function ContractsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const contracts = await prisma.contract.findMany({
    where: { teamId: session.teamId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Contrats" description="Gérez vos contrats d'entretien annuels">
        <Link href="/contracts/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau contrat
          </Button>
        </Link>
      </Header>

      {contracts.length === 0 ? (
        <Card>
          <EmptyState
            icon={FileSignature}
            title="Aucun contrat"
            description="Créez votre premier contrat d'entretien pour commencer."
            actionLabel="Créer un contrat"
            actionHref="/contracts/new"
          />
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
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visites
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
                {contracts.map((contract) => {
                  const status = statusLabels[contract.status] || {
                    label: contract.status,
                    variant: "default" as const,
                  };
                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-blue-600">
                          {contract.number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                            {contract.client.firstName[0]}
                            {contract.client.lastName[0]}
                          </div>
                          <span className="text-sm text-gray-900">
                            {contract.client.lastName} {contract.client.firstName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(contract.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {contract.visitsDone}/{contract.visits}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <form action={async () => {
                          "use server";
                          const { deleteContract } = await import("@/app/actions/contracts");
                          await deleteContract(contract.id);
                        }}>
                          <Button variant="ghost" size="sm" type="submit">
                            Supprimer
                          </Button>
                        </form>
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
