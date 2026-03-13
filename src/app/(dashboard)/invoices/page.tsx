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

type FilterStatus = "all" | "overdue" | "sent" | "paid";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" }> = {
  draft: { label: "Brouillon", variant: "default" },
  sent: { label: "Envoyée", variant: "warning" },
  paid: { label: "Payée", variant: "success" },
};

const filterTabs: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "overdue", label: "En retard" },
  { key: "sent", label: "En attente" },
  { key: "paid", label: "Payées" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { status: filterParam } = await searchParams;
  const filter: FilterStatus = (["all", "overdue", "sent", "paid"].includes(filterParam || "") ? filterParam : "all") as FilterStatus;

  const now = new Date();

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.userId },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  // Compute overdue status for each invoice
  const invoicesWithOverdue = invoices.map((invoice) => {
    const isOverdue = invoice.status === "sent" && invoice.dueDate != null && new Date(invoice.dueDate) < now;
    return { ...invoice, isOverdue };
  });

  // Apply filters
  const filteredInvoices = invoicesWithOverdue.filter((invoice) => {
    switch (filter) {
      case "overdue":
        return invoice.isOverdue;
      case "sent":
        return invoice.status === "sent" && !invoice.isOverdue;
      case "paid":
        return invoice.status === "paid";
      default:
        return true;
    }
  });

  // Compute totals (always from all invoices, not filtered)
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <>
      <Header title="Factures" description="Gérez vos factures clients">
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </Button>
        </Link>
      </Header>

      {/* Summary bar */}
      <div className="mb-4 text-sm text-gray-600">
        {invoices.length} facture{invoices.length > 1 ? "s" : ""} — Total : {formatCurrency(totalAmount)} — En attente : {formatCurrency(pendingAmount)}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {filterTabs.map((tab) => (
          <Link key={tab.key} href={tab.key === "all" ? "/invoices" : `/invoices?status=${tab.key}`}>
            <Button
              variant={filter === tab.key ? "primary" : "ghost"}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {filteredInvoices.length === 0 ? (
        <Card>
          <CardContent>
            {invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Aucune facture"
                description="Créez votre première facture pour commencer à facturer vos clients."
                actionLabel="Créer une facture"
                actionHref="/invoices/new"
              />
            ) : (
              <div className="py-8 text-center text-sm text-gray-500">
                Aucune facture dans cette catégorie
              </div>
            )}
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
                {filteredInvoices.map((invoice) => {
                  const config = invoice.isOverdue
                    ? { label: "En retard", variant: "danger" as const }
                    : statusConfig[invoice.status] || statusConfig.draft;
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {invoice.client.firstName} {invoice.client.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(invoice.date)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/invoices/${invoice.id}`}>
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
