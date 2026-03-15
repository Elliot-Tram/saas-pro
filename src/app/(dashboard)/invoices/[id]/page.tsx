import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Send, CheckCircle, Download, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { updateInvoiceStatus, deleteInvoice } from "@/app/actions/invoices";
import { SendEmailButton } from "@/components/ui/SendEmailButton";
import { sendInvoiceByEmail } from "@/app/actions/email";
import { PaymentReminderButton } from "@/components/invoices/PaymentReminderButton";

const statusConfig: Record<string, { label: string; variant: "default" | "warning" | "success" | "danger" }> = {
  draft: { label: "Brouillon", variant: "default" },
  sent: { label: "Envoyée", variant: "warning" },
  paid: { label: "Payée", variant: "success" },
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id, teamId: session.teamId },
    include: {
      items: true,
      client: true,
    },
  });

  if (!invoice) notFound();

  const now = new Date();
  const isOverdue = invoice.status === "sent" && invoice.dueDate != null && new Date(invoice.dueDate) < now;

  const config = isOverdue
    ? { label: "En retard", variant: "danger" as const }
    : statusConfig[invoice.status] || statusConfig.draft;

  const markAsSent = updateInvoiceStatus.bind(null, invoice.id, "sent");
  const markAsPaid = updateInvoiceStatus.bind(null, invoice.id, "paid");
  const handleDelete = deleteInvoice.bind(null, invoice.id);

  return (
    <>
      {/* Overdue alert banner */}
      {isOverdue && invoice.dueDate && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            Cette facture est en retard de paiement depuis le {formatDate(invoice.dueDate)}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{invoice.number}</h1>
              <Badge variant={config.variant}>{config.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Créée le {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {invoice.status === "draft" && (
            <form action={markAsSent}>
              <Button variant="secondary" size="sm" type="submit">
                <Send className="h-3.5 w-3.5" />
                Envoyée
              </Button>
            </form>
          )}
          {invoice.status === "sent" && (
            <>
              <form action={markAsPaid}>
                <Button variant="primary" size="sm" type="submit">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Payée
                </Button>
              </form>
              <PaymentReminderButton
                invoiceId={invoice.id}
                clientEmail={invoice.client.email}
              />
            </>
          )}
          <Link href={`/invoices/${invoice.id}/preview`}>
            <Button variant="secondary" size="sm">
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
          </Link>
          <SendEmailButton
            action={sendInvoiceByEmail}
            id={invoice.id}
            email={invoice.client.email}
          />
          <form action={handleDelete}>
            <Button variant="danger" size="sm" type="submit">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Détails de la facture</h2>
            </CardHeader>
            <CardContent className="p-0">
              {/* Client & Date info */}
              <div className="grid grid-cols-2 gap-6 px-6 py-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Client</p>
                  <p className="text-sm font-medium text-gray-900">
                    {invoice.client.firstName} {invoice.client.lastName}
                  </p>
                  {invoice.client.address && (
                    <p className="text-sm text-gray-500">{invoice.client.address}</p>
                  )}
                  {(invoice.client.postalCode || invoice.client.city) && (
                    <p className="text-sm text-gray-500">
                      {invoice.client.postalCode} {invoice.client.city}
                    </p>
                  )}
                  {invoice.client.email && (
                    <p className="text-sm text-gray-500">{invoice.client.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date de facturation</p>
                    <p className="text-sm text-gray-900">{formatDate(invoice.date)}</p>
                  </div>
                  {invoice.dueDate && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date d&apos;échéance</p>
                      <p className={`text-sm ${isOverdue ? "text-red-600 font-semibold" : "text-gray-900"}`}>
                        {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items table */}
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix unitaire
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Summary */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Récapitulatif</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total HT</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA ({invoice.taxRate}%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total TTC</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
              {/* Payment status */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Statut</span>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
