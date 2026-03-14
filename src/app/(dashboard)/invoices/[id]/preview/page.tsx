import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";

function fmtDate(date: Date | null | undefined) {
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

function fmtCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default async function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, teamId: session.teamId },
    include: { items: true, client: true, team: true },
  });

  if (!invoice) notFound();

  const companyName = invoice.team.company || invoice.team.name;
  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;
  const clientAddr = [invoice.client.address, [invoice.client.postalCode, invoice.client.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  const proParts = [
    invoice.team.siret ? `SIRET : ${invoice.team.siret}` : null,
    invoice.team.insurerName ? `Assurance RC : ${invoice.team.insurerName}${invoice.team.insuranceNumber ? ` \u2013 Police n\u00b0${invoice.team.insuranceNumber}` : ""}` : null,
  ].filter(Boolean);

  const statusLabel = invoice.status === "paid" ? "Pay\u00e9e" : invoice.status === "sent" ? "Envoy\u00e9e" : "Brouillon";
  const statusClass = invoice.status === "paid" ? "badge-green" : invoice.status === "sent" ? "badge-blue" : "badge-gray";

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          .invoice { box-shadow: none !important; margin: 0 !important; }
          /* Hide ALL dashboard chrome */
          aside, nav,
          div[class*="lg:pl-"], div[class*="pl-64"],
          .fixed { display: none !important; position: static !important; }
          main, main > div, body > div {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            padding-top: 0 !important;
          }
          body > div > div > main { padding-left: 0 !important; }
        }

        /* Also hide mobile header bar on screen for preview */
        .preview-wrapper .fixed:not(.print-bar) {
          display: none !important;
        }

        @page {
          margin: 0;
          size: A4;
        }

        .invoice {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111827;
          font-size: 12.5px;
          line-height: 1.5;
          position: relative;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .accent-bar {
          height: 5px;
          background: linear-gradient(90deg, #0f2b46, #1e40af);
          flex-shrink: 0;
        }

        .content {
          padding: 22px 36px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: start;
          margin-bottom: 10px;
        }

        .logo {
          max-height: 40px;
          max-width: 70px;
          object-fit: contain;
        }

        .company-name {
          font-size: 13px;
          font-weight: 700;
          color: #0f2b46;
          margin-bottom: 1px;
        }

        .company-detail {
          font-size: 7.5px;
          color: #6b7280;
          line-height: 1.5;
        }

        .title-main {
          font-size: 20px;
          font-weight: 700;
          color: #0f2b46;
          line-height: 1.15;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cert-meta {
          font-size: 8px;
          color: #6b7280;
          line-height: 1.4;
        }

        /* Separator */
        .sep { border: none; border-top: 1px solid #e5e7eb; margin: 0 0 6px; }

        /* Pro bar */
        .pro-bar {
          background: #f9fafb;
          border-radius: 4px;
          padding: 4px 10px;
          text-align: center;
          font-size: 7px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .pro-bar .divider { margin: 0 6px; color: #d1d5db; }

        /* Section */
        .section { margin-bottom: 14px; }
        .section-title {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0f2b46;
          padding-bottom: 4px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 8px;
        }

        /* Cards */
        .card {
          border-left: 2px solid #e5e7eb;
          padding: 10px 14px;
          margin-bottom: 2px;
        }
        .card-filled {
          background: #f9fafb;
          border-left-color: #d1d5db;
        }

        /* Grid */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; }

        /* Fields */
        .field { margin-bottom: 6px; }
        .field-label {
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 0;
        }
        .field-value {
          font-size: 12.5px;
          color: #111827;
          font-weight: 500;
        }
        .field-value-bold {
          font-size: 12.5px;
          color: #111827;
          font-weight: 700;
        }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 5px 16px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .badge-green {
          background: #ecfdf5;
          color: #059669;
          border: 2px solid #a7f3d0;
        }
        .badge-blue {
          background: #eff6ff;
          color: #2563eb;
          border: 2px solid #bfdbfe;
        }
        .badge-gray {
          background: #f9fafb;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }

        /* Invoice table */
        .inv-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .inv-table th {
          background: #0f2b46;
          color: #fff;
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 7px 10px;
          text-align: left;
        }
        .inv-table th:nth-child(2),
        .inv-table th:nth-child(3),
        .inv-table th:nth-child(4) {
          text-align: right;
        }
        .inv-table td {
          padding: 6px 10px;
          font-size: 12.5px;
          color: #111827;
        }
        .inv-table td:nth-child(2),
        .inv-table td:nth-child(3),
        .inv-table td:nth-child(4) {
          text-align: right;
        }
        .inv-table tr:nth-child(even) {
          background: #f9fafb;
        }
        .inv-table tr:nth-child(odd) {
          background: #fff;
        }

        /* Totals block */
        .totals-block {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        .totals-inner {
          width: 220px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 10px;
          font-size: 12.5px;
        }
        .total-row-label {
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
        }
        .total-row-value {
          font-size: 12.5px;
          font-weight: 600;
          color: #111827;
        }
        .total-row-final {
          background: #0f2b46;
          border-radius: 4px;
          padding: 8px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }
        .total-row-final-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #fff;
        }
        .total-row-final-value {
          font-size: 14px;
          font-weight: 800;
          color: #fff;
        }

        /* Payment info */
        .payment-info {
          display: flex;
          align-items: center;
          gap: 24px;
          margin-top: 10px;
          padding: 8px 14px;
          background: #f9fafb;
          border-radius: 4px;
        }

        /* Footer */
        .footer {
          text-align: center;
          padding: 6px 32px 6px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
          flex-shrink: 0;
        }
        .footer-text { font-size: 7px; color: #9ca3af; line-height: 1.6; }
        .footer-brand { font-size: 6.5px; color: #d1d5db; margin-top: 2px; }

        /* Print button bar */
        .print-bar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #0f2b46;
          color: white;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .print-bar button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 8px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .print-bar button:hover { background: #1d4ed8; }
        .print-bar a {
          color: #94a3b8;
          font-size: 14px;
          text-decoration: none;
        }
        .print-bar a:hover { color: white; }

        body { background: #f1f5f9; padding-top: 60px; }
        @media print { body { background: white; padding-top: 0; } }
      `}</style>

      {/* Dynamic page title for PDF filename */}
      <title>{`Facture-${invoice.client.lastName}-${invoice.client.firstName}-${fmtDate(invoice.date).replace(/\//g, "-")}`}</title>

      {/* Print bar */}
      <div className="print-bar no-print">
        <a href={`/invoices/${invoice.id}`}>&larr; Retour</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>Aper&ccedil;u de la facture</span>
          <PrintButton />
        </div>
      </div>

      <div className="preview-wrapper">
      <div className="invoice">
        <div className="accent-bar" />
        <div className="content">

          {/* Title centered */}
          <div style={{ textAlign: "center", marginBottom: 10, marginTop: 4 }}>
            <div className="title-main">Facture</div>
            <div style={{ width: 32, height: 2, background: "#2563eb", margin: "4px auto 6px" }} />
            <div className="cert-meta">N&deg; {invoice.number} &mdash; {fmtDate(invoice.date)}</div>
          </div>

          {/* Company + N° row */}
          <div className="header">
            <div>
              {invoice.team.logo && <img src={invoice.team.logo} className="logo" alt="Logo" />}
            </div>
            <div>
              <div className="company-name">{companyName}</div>
              {invoice.team.address && <div className="company-detail">{invoice.team.address}</div>}
              {(invoice.team.postalCode || invoice.team.city) && (
                <div className="company-detail">{[invoice.team.postalCode, invoice.team.city].filter(Boolean).join(" ")}</div>
              )}
              {invoice.team.phone && <div className="company-detail">T&eacute;l. {invoice.team.phone}</div>}
            </div>
            <div />
          </div>

          <hr className="sep" />

          {/* Pro info bar */}
          {proParts.length > 0 && (
            <div className="pro-bar">
              {proParts.map((p, i) => (
                <span key={i}>{i > 0 && <span className="divider">|</span>}{p}</span>
              ))}
            </div>
          )}

          {/* Factur&eacute; &agrave; */}
          <div className="section">
            <div className="section-title">Factur&eacute; &agrave;</div>
            <div className="card card-filled">
              <div className="grid-2">
                <div>
                  <div className="field">
                    <div className="field-value-bold">{clientName}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Adresse</div>
                    <div className="field-value">{clientAddr}</div>
                  </div>
                </div>
                <div>
                  {invoice.client.phone && (
                    <div className="field">
                      <div className="field-label">T&eacute;l&eacute;phone</div>
                      <div className="field-value">{invoice.client.phone}</div>
                    </div>
                  )}
                  {invoice.client.email && (
                    <div className="field">
                      <div className="field-label">Email</div>
                      <div className="field-value">{invoice.client.email}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* D&eacute;tail des prestations */}
          <div className="section">
            <div className="section-title">D&eacute;tail des prestations</div>
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qt&eacute;</th>
                  <th>Prix unit.</th>
                  <th>Total HT</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{fmtCurrency(item.unitPrice)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals-block">
            <div className="totals-inner">
              <div className="total-row">
                <span className="total-row-label">Sous-total HT</span>
                <span className="total-row-value">{fmtCurrency(invoice.subtotal)}</span>
              </div>
              <div className="total-row">
                <span className="total-row-label">TVA ({invoice.taxRate}%)</span>
                <span className="total-row-value">{fmtCurrency(invoice.tax)}</span>
              </div>
              <div className="total-row-final">
                <span className="total-row-final-label">Total TTC</span>
                <span className="total-row-final-value">{fmtCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="payment-info">
            {invoice.dueDate && (
              <div className="field" style={{ marginBottom: 0 }}>
                <div className="field-label">&Eacute;ch&eacute;ance</div>
                <div className="field-value">{fmtDate(invoice.dueDate)}</div>
              </div>
            )}
            <div className="field" style={{ marginBottom: 0 }}>
              <div className="field-label">Statut</div>
              <span className={`badge ${statusClass}`}>{statusLabel}</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-text">
            {companyName}
            {invoice.team.address && ` \u2013 ${invoice.team.address}`}
            {(invoice.team.postalCode || invoice.team.city) && ` \u2013 ${[invoice.team.postalCode, invoice.team.city].filter(Boolean).join(" ")}`}
            {invoice.team.phone && ` \u2013 T\u00e9l. ${invoice.team.phone}`}
          </div>
          {invoice.team.siret && (
            <div className="footer-text">SIRET : {invoice.team.siret}</div>
          )}
          <div className="footer-brand">Bistry \u2013 Logiciel de gestion pour ramoneurs</div>
        </div>
      </div>
      </div>
    </>
  );
}
