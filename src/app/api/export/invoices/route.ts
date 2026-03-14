import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year") || new Date().getFullYear().toString();
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const invoices = await prisma.invoice.findMany({
    where: {
      teamId: session.teamId,
      date: { gte: startDate, lte: endDate },
    },
    include: { client: true, items: true },
    orderBy: { date: "asc" },
  });

  // CSV header
  const headers = [
    "Numéro",
    "Date",
    "Client",
    "Adresse client",
    "Statut",
    "Sous-total HT",
    "TVA (%)",
    "TVA (€)",
    "Total TTC",
    "Date échéance",
    "Prestations",
  ];

  const rows = invoices.map((inv) => {
    const clientName = `${inv.client.firstName} ${inv.client.lastName}`;
    const clientAddr = [inv.client.address, inv.client.postalCode, inv.client.city]
      .filter(Boolean)
      .join(" ");
    const statusMap: Record<string, string> = {
      draft: "Brouillon",
      sent: "Envoyée",
      paid: "Payée",
    };
    const prestations = inv.items
      .map((item) => `${item.description} (x${item.quantity})`)
      .join(" | ");

    const fmtDate = (d: Date | null) =>
      d ? new Intl.DateTimeFormat("fr-FR").format(new Date(d)) : "";

    return [
      inv.number,
      fmtDate(inv.date),
      clientName,
      clientAddr,
      statusMap[inv.status] || inv.status,
      inv.subtotal.toFixed(2),
      inv.taxRate.toFixed(0),
      inv.tax.toFixed(2),
      inv.total.toFixed(2),
      inv.dueDate ? fmtDate(inv.dueDate) : "",
      prestations,
    ];
  });

  // Build CSV with BOM for Excel French compatibility
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    headers.join(";") +
    "\n" +
    rows.map((row) => row.map((cell) => `"${cell}"`).join(";")).join("\n");

  // Summary line
  const totalHT = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalTVA = invoices.reduce((s, i) => s + i.tax, 0);
  const totalTTC = invoices.reduce((s, i) => s + i.total, 0);
  const paidTTC = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

  const summary = `\n\n"TOTAUX ${year}";"";"";"";"";"${totalHT.toFixed(2)}";"";${totalTVA.toFixed(2)};"${totalTTC.toFixed(2)}";"";"""\n"DONT ENCAISSÉ";"";"";"";"";"";"";"";${paidTTC.toFixed(2)};"";""`;

  return new NextResponse(csvContent + summary, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="factures-${year}.csv"`,
    },
  });
}
