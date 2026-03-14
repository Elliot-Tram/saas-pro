import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// ── Helpers ─────────────────────────────────────────────────────────────────────

function safe(val: string | null | undefined, fallback = "\u2014"): string {
  return val && val.trim() ? val.trim() : fallback;
}

function fmtDate(date: Date | null | undefined): string {
  if (!date) return "\u2014";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function fmtCurrency(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " \u20ac";
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Pay\u00e9e";
    case "sent":
      return "Envoy\u00e9e";
    case "overdue":
      return "En retard";
    default:
      return "Brouillon";
  }
}

function statusClass(status: string): string {
  switch (status) {
    case "paid":
      return "badge-green";
    case "sent":
      return "badge-blue";
    case "overdue":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

// ── Build the full HTML invoice ─────────────────────────────────────────────────

function buildInvoiceHtml(invoice: {
  number: string;
  status: string;
  date: Date;
  dueDate: Date | null;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  client: {
    firstName: string | null;
    lastName: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
  };
  team: {
    name: string | null;
    company: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    postalCode: string | null;
    siret: string | null;
    logo: string | null;
    insuranceNumber: string | null;
    insurerName: string | null;
  };
}): string {
  const clientName =
    `${safe(invoice.client.firstName, "")} ${safe(invoice.client.lastName, "")}`.trim() || "\u2014";
  const clientAddr = [
    invoice.client.address,
    [invoice.client.postalCode, invoice.client.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

  const companyName = safe(
    invoice.team.company || invoice.team.name,
    "Entreprise"
  );
  const companyLines = [
    invoice.team.address,
    [invoice.team.postalCode, invoice.team.city].filter(Boolean).join(" "),
    invoice.team.phone ? `T\u00e9l. ${invoice.team.phone}` : null,
  ].filter(Boolean) as string[];

  const proParts = [
    invoice.team.siret ? `SIRET : ${invoice.team.siret}` : null,
    invoice.team.insurerName
      ? `Assurance RC : ${invoice.team.insurerName}${invoice.team.insuranceNumber ? ` \u2014 Police n\u00b0${invoice.team.insuranceNumber}` : ""}`
      : null,
  ].filter(Boolean) as string[];

  const logoHtml = invoice.team.logo
    ? `<img src="${invoice.team.logo}" class="logo" alt="Logo" />`
    : "";

  // Build item rows with alternating backgrounds
  const itemRowsHtml = invoice.items
    .map(
      (item, i) => `
        <tr class="${i % 2 === 1 ? "row-alt" : ""}">
          <td class="td-desc">${escHtml(item.description)}</td>
          <td class="td-center">${item.quantity}</td>
          <td class="td-right">${escHtml(fmtCurrency(item.unitPrice))}</td>
          <td class="td-right td-bold">${escHtml(fmtCurrency(item.total))}</td>
        </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  @page {
    margin: 0;
    size: A4;
  }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1a1a1a;
    background: #fff;
    font-size: 12px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 0;
    position: relative;
    overflow: hidden;
  }

  /* ── Top accent bar ───────────────────────────────── */
  .accent-bar {
    height: 5px;
    background: linear-gradient(90deg, #1e3a5f, #2a5a8f);
    width: 100%;
  }

  /* ── Content area ─────────────────────────────────── */
  .content {
    padding: 28px 40px 20px 40px;
  }

  /* ── Header ───────────────────────────────────────── */
  .header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 16px;
    align-items: start;
    margin-bottom: 20px;
  }

  .logo {
    max-height: 70px;
    max-width: 100px;
    object-fit: contain;
  }

  .company-info {
    padding-top: 2px;
  }

  .company-name {
    font-size: 16px;
    font-weight: 700;
    color: #1e3a5f;
    margin-bottom: 4px;
    letter-spacing: -0.01em;
  }

  .company-detail {
    font-size: 9px;
    color: #6b7280;
    line-height: 1.6;
  }

  .title-block {
    text-align: right;
    padding-top: 2px;
  }

  .title-main {
    font-size: 26px;
    font-weight: 800;
    color: #1e3a5f;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 6px;
  }

  .invoice-number {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }

  .invoice-date {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 2px;
  }

  /* ── Separator ────────────────────────────────────── */
  .separator {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0 0 14px 0;
  }

  .separator-footer {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 20px 0 12px 0;
  }

  /* ── Pro info bar ─────────────────────────────────── */
  .pro-bar {
    background: #f8f9fb;
    border-radius: 6px;
    padding: 8px 14px;
    text-align: center;
    font-size: 8px;
    color: #6b7280;
    margin-bottom: 18px;
    letter-spacing: 0.02em;
  }

  .pro-bar span {
    margin: 0 8px;
    color: #d1d5db;
  }

  /* ── Section card ─────────────────────────────────── */
  .section {
    margin-bottom: 16px;
  }

  .section-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .section-accent {
    width: 3px;
    height: 14px;
    background: #1e3a5f;
    border-radius: 2px;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #1e3a5f;
  }

  /* ── Card styles ──────────────────────────────────── */
  .card {
    border-radius: 8px;
    padding: 14px 18px;
  }

  .card-filled {
    background: #f8f9fb;
  }

  /* ── Grid layouts ─────────────────────────────────── */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 32px;
  }

  /* ── Field (label + value) ────────────────────────── */
  .field {
    margin-bottom: 6px;
  }

  .field-label {
    font-size: 9px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
    margin-bottom: 1px;
  }

  .field-value {
    font-size: 12px;
    color: #1a1a1a;
    font-weight: 500;
  }

  .field-value-bold {
    font-size: 12px;
    color: #1a1a1a;
    font-weight: 700;
  }

  /* ── Badges ───────────────────────────────────────── */
  .badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge-green {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
  }

  .badge-blue {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #bfdbfe;
  }

  .badge-red {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .badge-gray {
    background: #f3f4f6;
    color: #6b7280;
    border: 1px solid #e5e7eb;
  }

  /* ── Items table ───────────────────────────────────── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    border-radius: 8px;
    overflow: hidden;
    font-size: 11px;
  }

  .items-table thead th {
    background: #1e3a5f;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 10px 14px;
    text-align: left;
    white-space: nowrap;
  }

  .items-table thead th:nth-child(2),
  .items-table thead th:nth-child(3),
  .items-table thead th:nth-child(4) {
    text-align: right;
  }

  .items-table tbody td {
    padding: 10px 14px;
    border-bottom: 1px solid #f3f4f6;
    color: #374151;
    vertical-align: top;
  }

  .row-alt td {
    background: #f9fafb;
  }

  .td-desc {
    max-width: 260px;
    line-height: 1.4;
    color: #1a1a1a;
    font-weight: 500;
  }

  .td-center {
    text-align: right;
    white-space: nowrap;
    color: #6b7280;
  }

  .td-right {
    text-align: right;
    white-space: nowrap;
    color: #6b7280;
  }

  .td-bold {
    font-weight: 600;
    color: #1a1a1a;
  }

  /* ── Totals section ────────────────────────────────── */
  .totals-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .totals-block {
    width: 260px;
  }

  .totals-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
  }

  .totals-row + .totals-row {
    border-top: 1px solid #f3f4f6;
  }

  .totals-label {
    font-size: 11px;
    color: #6b7280;
    font-weight: 500;
  }

  .totals-value {
    font-size: 11px;
    color: #1a1a1a;
    font-weight: 500;
  }

  .total-ttc-row {
    background: linear-gradient(135deg, #1e3a5f, #2a5a8f);
    border-radius: 8px;
    padding: 12px 16px !important;
    margin-top: 8px;
    border: none !important;
  }

  .total-ttc-label {
    font-size: 12px;
    color: #fff;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .total-ttc-value {
    font-size: 16px;
    color: #fff;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  /* ── Payment info ──────────────────────────────────── */
  .payment-info {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-top: 20px;
    padding: 14px 18px;
    background: #f8f9fb;
    border-radius: 8px;
    border-left: 3px solid #1e3a5f;
  }

  .payment-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .payment-label {
    font-size: 9px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .payment-value {
    font-size: 12px;
    color: #1a1a1a;
    font-weight: 600;
  }

  /* ── Footer ───────────────────────────────────────── */
  .footer {
    text-align: center;
    padding: 0 40px;
    position: absolute;
    bottom: 24px;
    left: 0;
    right: 0;
  }

  .footer-text {
    font-size: 7.5px;
    color: #9ca3af;
    line-height: 1.7;
  }

  .footer-divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0 0 10px 0;
  }
</style>
</head>
<body>
<div class="page">
  <!-- Top accent bar -->
  <div class="accent-bar"></div>

  <div class="content">
    <!-- ═══════ HEADER ═══════ -->
    <div class="header">
      <div>
        ${logoHtml}
      </div>
      <div class="company-info">
        <div class="company-name">${escHtml(companyName)}</div>
        ${companyLines.map((l) => `<div class="company-detail">${escHtml(l)}</div>`).join("\n        ")}
      </div>
      <div class="title-block">
        <div class="title-main">FACTURE</div>
        <div class="invoice-number">N\u00b0 ${escHtml(safe(invoice.number))}</div>
        <div class="invoice-date">Date : ${fmtDate(invoice.date)}</div>
      </div>
    </div>

    <hr class="separator" />

    <!-- ═══════ PRO INFO BAR ═══════ -->
    ${
      proParts.length > 0
        ? `<div class="pro-bar">${proParts.map((p) => escHtml(p)).join('<span>|</span>')}</div>`
        : ""
    }

    <!-- ═══════ CLIENT ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-accent"></div>
        <div class="section-title">Factur\u00e9 \u00e0</div>
      </div>
      <div class="card card-filled">
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-value-bold">${escHtml(clientName)}</div>
            </div>
            <div class="field">
              <div class="field-label">Adresse</div>
              <div class="field-value">${escHtml(safe(clientAddr))}</div>
            </div>
          </div>
          <div>
            ${
              invoice.client.phone
                ? `<div class="field">
              <div class="field-label">T\u00e9l\u00e9phone</div>
              <div class="field-value">${escHtml(invoice.client.phone)}</div>
            </div>`
                : ""
            }
            ${
              invoice.client.email
                ? `<div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${escHtml(invoice.client.email)}</div>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ LINE ITEMS TABLE ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-accent"></div>
        <div class="section-title">D\u00e9tail des prestations</div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 50%">Description</th>
            <th style="width: 12%">Qt\u00e9</th>
            <th style="width: 19%">Prix unitaire</th>
            <th style="width: 19%">Total HT</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
      </table>

      <!-- ═══════ TOTALS ═══════ -->
      <div class="totals-wrapper">
        <div class="totals-block">
          <div class="totals-row">
            <div class="totals-label">Sous-total HT</div>
            <div class="totals-value">${escHtml(fmtCurrency(invoice.subtotal))}</div>
          </div>
          <div class="totals-row">
            <div class="totals-label">TVA (${invoice.taxRate}%)</div>
            <div class="totals-value">${escHtml(fmtCurrency(invoice.tax))}</div>
          </div>
          <div class="totals-row total-ttc-row">
            <div class="total-ttc-label">Total TTC</div>
            <div class="total-ttc-value">${escHtml(fmtCurrency(invoice.total))}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ PAYMENT INFO ═══════ -->
    <div class="payment-info">
      ${
        invoice.dueDate
          ? `<div class="payment-field">
        <div class="payment-label">\u00c9ch\u00e9ance</div>
        <div class="payment-value">${fmtDate(invoice.dueDate)}</div>
      </div>`
          : ""
      }
      <div class="payment-field">
        <div class="payment-label">Statut</div>
        <div><span class="badge ${statusClass(invoice.status)}">${statusLabel(invoice.status)}</span></div>
      </div>
    </div>
  </div>

  <!-- ═══════ FOOTER ═══════ -->
  <div class="footer">
    <hr class="footer-divider" />
    <div class="footer-text">
      ${escHtml(companyName)}${invoice.team.siret ? ` \u2014 SIRET : ${escHtml(invoice.team.siret)}` : ""}${invoice.team.address ? ` \u2014 ${escHtml(invoice.team.address)}` : ""}${invoice.team.postalCode || invoice.team.city ? `, ${escHtml([invoice.team.postalCode, invoice.team.city].filter(Boolean).join(" "))}` : ""}
    </div>
    <div class="footer-text">
      ${invoice.team.phone ? `T\u00e9l. ${escHtml(invoice.team.phone)}` : ""}
    </div>
  </div>
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Non autoris\u00e9" }, { status: 401 });

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id, teamId: session.teamId },
    include: {
      items: true,
      client: true,
      team: true,
    },
  });

  if (!invoice)
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });

  // Build the HTML invoice
  const html = buildInvoiceHtml(
    invoice as Parameters<typeof buildInvoiceHtml>[0]
  );

  // Launch Puppeteer
  let browser;
  try {
    const isDev = process.env.NODE_ENV === "development";

    if (isDev) {
      // Development: use local Chrome
      const possiblePaths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ];

      let execPath: string | undefined;
      const fs = await import("fs");
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          execPath = p;
          break;
        }
      }

      browser = await puppeteer.launch({
        headless: true,
        executablePath: execPath,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    } else {
      // Production (Vercel): use @sparticuz/chromium
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="facture-${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    if (browser) {
      try {
        await browser.close();
      } catch {
        /* ignore close errors */
      }
    }
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la g\u00e9n\u00e9ration du PDF" },
      { status: 500 }
    );
  }
}
