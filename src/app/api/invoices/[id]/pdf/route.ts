import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, PDFImage } from "pdf-lib";

// ── Color palette ────────────────────────────────────────────────────────────
const NAVY = rgb(0.06, 0.17, 0.27);
const BLUE = rgb(0.15, 0.39, 0.93);
const EMERALD = rgb(0.02, 0.59, 0.41);
const RED = rgb(0.86, 0.15, 0.15);
const DARK = rgb(0.07, 0.09, 0.11);
const GRAY = rgb(0.42, 0.45, 0.49);
const LIGHT_GRAY = rgb(0.9, 0.91, 0.92);
const BG = rgb(0.98, 0.98, 0.99);
const WHITE = rgb(1, 1, 1);

const GREEN_BG = rgb(0.86, 0.99, 0.9);
const GREEN_BORDER = rgb(0.73, 0.97, 0.83);
const BLUE_BG_BADGE = rgb(0.86, 0.92, 0.99);
const BLUE_BORDER_BADGE = rgb(0.75, 0.86, 0.99);
const RED_BG = rgb(1, 0.95, 0.95);
const RED_BORDER = rgb(0.99, 0.79, 0.79);
const GRAY_BG_BADGE = rgb(0.95, 0.96, 0.96);
const GRAY_BORDER_BADGE = rgb(0.9, 0.91, 0.92);

// ── Page dimensions (A4) ─────────────────────────────────────────────────────
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_L = 44;
const MARGIN_R = 44;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// ── Helpers ──────────────────────────────────────────────────────────────────

function safe(val: string | null | undefined, fallback = "--"): string {
  return val && val.trim() ? val.trim() : fallback;
}

function fmtDate(date: Date | null | undefined): string {
  if (!date) return "--";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function fmtCurrency(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " EUR";
}

function statusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "PAYEE";
    case "sent":
      return "ENVOYEE";
    case "overdue":
      return "EN RETARD";
    default:
      return "BROUILLON";
  }
}

// ── Helper: sanitize text for Helvetica (WinAnsi/Latin-1 encoding) ──────────
function sanitize(str: string): string {
  return str
    .replace(/\u2014/g, "\u2013")
    .replace(/\u00a0/g, " ")
    .replace(/\u20ac/g, "EUR");
}

// ── Helper: embed image from data URL ────────────────────────────────────────
async function embedImage(
  pdfDoc: PDFDocument,
  dataUrl: string | null | undefined
): Promise<PDFImage | null> {
  if (!dataUrl) return null;
  try {
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return dataUrl.includes("image/png")
      ? await pdfDoc.embedPng(bytes)
      : await pdfDoc.embedJpg(bytes);
  } catch {
    return null;
  }
}

// ── Helper: word wrap ────────────────────────────────────────────────────────
function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(sanitize(test), size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

// ── Helper: draw accent bar ─────────────────────────────────────────────────
function drawAccentBar(
  page: PDFPage,
  x: number,
  y: number,
  width: number
) {
  page.drawRectangle({
    x,
    y,
    width,
    height: 6,
    color: NAVY,
  });
}

// ── Helper: draw section header ──────────────────────────────────────────────
function drawSectionHeader(
  page: PDFPage,
  title: string,
  y: number,
  fontBold: PDFFont,
  width: number
): number {
  const text = sanitize(title.toUpperCase());
  page.drawText(text, {
    x: MARGIN_L,
    y,
    size: 8.5,
    font: fontBold,
    color: NAVY,
  });
  page.drawLine({
    start: { x: MARGIN_L, y: y - 8 },
    end: { x: MARGIN_L + width, y: y - 8 },
    thickness: 0.75,
    color: LIGHT_GRAY,
  });
  return y - 22;
}

// ── Helper: draw field (label + value) ───────────────────────────────────────
function drawField(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  fontR: PDFFont,
  fontB: PDFFont,
  bold = false
): number {
  const labelText = sanitize(label.toUpperCase());
  page.drawText(labelText, {
    x,
    y,
    size: 7.5,
    font: fontR,
    color: GRAY,
  });
  const valText = sanitize(value);
  page.drawText(valText, {
    x,
    y: y - 12,
    size: 9.5,
    font: bold ? fontB : fontR,
    color: DARK,
  });
  return y - 28;
}

// ── Helper: draw badge ───────────────────────────────────────────────────────
function drawBadge(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  textColor: ReturnType<typeof rgb>,
  bgColor: ReturnType<typeof rgb>,
  borderColor: ReturnType<typeof rgb>
): number {
  const displayText = sanitize(text);
  const textWidth = font.widthOfTextAtSize(displayText, 9);
  const padding = 10;
  const height = 18;
  const width = textWidth + padding * 2;
  page.drawRectangle({
    x,
    y: y - 4,
    width,
    height,
    color: bgColor,
  });
  page.drawRectangle({
    x,
    y: y - 4,
    width,
    height,
    borderColor,
    borderWidth: 1,
    opacity: 0,
  });
  page.drawText(displayText, {
    x: x + padding,
    y: y + 1,
    size: 9,
    font,
    color: textColor,
  });
  return width;
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
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

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

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    // Load Plus Jakarta Sans font
    const fs = await import("fs");
    const path = await import("path");
    let fontR, fontB;
    try {
      const fontPath = path.join(process.cwd(), "public/fonts/PlusJakartaSans-Regular.ttf");
      const fontBytes = fs.readFileSync(fontPath);
      fontR = await pdfDoc.embedFont(fontBytes);
      fontB = await pdfDoc.embedFont(fontBytes);
    } catch {
      fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
      fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    }

    // Embed images
    const logoImg = await embedImage(pdfDoc, invoice.team.logo);

    // Derived data
    const clientName =
      `${safe(invoice.client.firstName, "")} ${safe(invoice.client.lastName, "")}`.trim() || "--";
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
      invoice.team.phone ? `Tel. ${invoice.team.phone}` : null,
    ].filter(Boolean) as string[];

    const proParts = [
      invoice.team.siret ? `SIRET : ${invoice.team.siret}` : null,
      invoice.team.insurerName
        ? `Assurance RC : ${invoice.team.insurerName}${invoice.team.insuranceNumber ? ` -- Police n${invoice.team.insuranceNumber}` : ""}`
        : null,
    ].filter(Boolean) as string[];

    // ═══════ 1. TOP BAR ═══════
    drawAccentBar(page, 0, PAGE_H - 6, PAGE_W);

    // ═══════ 2. HEADER ═══════
    let curY = PAGE_H - 48;

    // Logo + company info on left
    let logoEndX = MARGIN_L;
    if (logoImg) {
      const logoDims = logoImg.scale(1);
      const maxH = 55;
      const scale = Math.min(maxH / logoDims.height, 90 / logoDims.width, 1);
      const lw = logoDims.width * scale;
      const lh = logoDims.height * scale;
      page.drawImage(logoImg, {
        x: MARGIN_L,
        y: curY - lh + 14,
        width: lw,
        height: lh,
      });
      logoEndX = MARGIN_L + lw + 14;
    }

    // Company name
    page.drawText(sanitize(companyName), {
      x: logoEndX,
      y: curY,
      size: 14,
      font: fontB,
      color: NAVY,
    });

    // Company address lines
    let compY = curY - 14;
    for (const line of companyLines) {
      page.drawText(sanitize(line), {
        x: logoEndX,
        y: compY,
        size: 7.5,
        font: fontR,
        color: GRAY,
      });
      compY -= 11;
    }

    // Right side: Title
    const titleText = "FACTURE";
    const titleWidth = fontB.widthOfTextAtSize(titleText, 22);
    page.drawText(titleText, {
      x: PAGE_W - MARGIN_R - titleWidth,
      y: curY + 2,
      size: 22,
      font: fontB,
      color: NAVY,
    });

    // Invoice number and date
    const numText = sanitize(`N\u00b0 ${safe(invoice.number)}`);
    const numWidth = fontR.widthOfTextAtSize(numText, 9);
    page.drawText(numText, {
      x: PAGE_W - MARGIN_R - numWidth,
      y: curY - 16,
      size: 9,
      font: fontR,
      color: GRAY,
    });

    const dateText = sanitize(`Date : ${fmtDate(invoice.date)}`);
    const dateWidth = fontR.widthOfTextAtSize(dateText, 9);
    page.drawText(dateText, {
      x: PAGE_W - MARGIN_R - dateWidth,
      y: curY - 28,
      size: 9,
      font: fontR,
      color: GRAY,
    });

    // ═══════ 3. SEPARATOR ═══════
    curY = PAGE_H - 110;
    page.drawLine({
      start: { x: MARGIN_L, y: curY },
      end: { x: PAGE_W - MARGIN_R, y: curY },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });

    // ═══════ 4. PRO INFO BAR ═══════
    if (proParts.length > 0) {
      curY -= 20;
      const proText = sanitize(proParts.join("  |  "));
      const proWidth = fontR.widthOfTextAtSize(proText, 7);
      const proBarW = CONTENT_W;
      page.drawRectangle({
        x: MARGIN_L,
        y: curY - 6,
        width: proBarW,
        height: 18,
        color: BG,
      });
      page.drawText(proText, {
        x: MARGIN_L + (proBarW - proWidth) / 2,
        y: curY,
        size: 7,
        font: fontR,
        color: GRAY,
      });
      curY -= 28;
    } else {
      curY -= 16;
    }

    // ═══════ 5. CLIENT SECTION ═══════
    curY = drawSectionHeader(page, "Facture a", curY, fontB, CONTENT_W);

    const colMid = MARGIN_L + CONTENT_W / 2 + 10;

    // Light gray background card
    const clientCardH = 52;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - clientCardH + 14,
      width: CONTENT_W,
      height: clientCardH,
      color: BG,
    });

    // Client name (bold)
    page.drawText(sanitize(clientName), {
      x: MARGIN_L + 14,
      y: curY,
      size: 10,
      font: fontB,
      color: DARK,
    });

    // Address
    drawField(page, "ADRESSE", safe(clientAddr), MARGIN_L + 14, curY - 16, fontR, fontB);

    // Right column: phone & email
    let rightFieldY = curY;
    if (invoice.client.phone) {
      rightFieldY = drawField(page, "TELEPHONE", invoice.client.phone, colMid, rightFieldY, fontR, fontB);
    }
    if (invoice.client.email) {
      drawField(page, "EMAIL", invoice.client.email, colMid, rightFieldY, fontR, fontB);
    }

    curY -= clientCardH + 8;

    // ═══════ 6. LINE ITEMS TABLE ═══════
    curY = drawSectionHeader(page, "Detail des prestations", curY, fontB, CONTENT_W);

    // Table column positions
    const colDesc = MARGIN_L;
    const colQty = MARGIN_L + CONTENT_W * 0.55;
    const colUnit = MARGIN_L + CONTENT_W * 0.70;
    const colTotal = MARGIN_L + CONTENT_W * 0.87;
    const tableRight = MARGIN_L + CONTENT_W;
    const rowH = 26;

    // Table header
    const headerH = 28;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - headerH + 12,
      width: CONTENT_W,
      height: headerH,
      color: NAVY,
    });

    const headerY = curY - 2;
    page.drawText("DESCRIPTION", {
      x: colDesc + 12,
      y: headerY,
      size: 7.5,
      font: fontB,
      color: WHITE,
    });
    const qtyText = "QTE";
    page.drawText(qtyText, {
      x: colQty + (colUnit - colQty) / 2 - fontB.widthOfTextAtSize(qtyText, 7.5) / 2,
      y: headerY,
      size: 7.5,
      font: fontB,
      color: WHITE,
    });
    const unitText = "PRIX UNIT.";
    page.drawText(unitText, {
      x: colTotal - fontB.widthOfTextAtSize(unitText, 7.5) - 4,
      y: headerY,
      size: 7.5,
      font: fontB,
      color: WHITE,
    });
    const totalHText = "TOTAL HT";
    page.drawText(totalHText, {
      x: tableRight - fontB.widthOfTextAtSize(totalHText, 7.5) - 8,
      y: headerY,
      size: 7.5,
      font: fontB,
      color: WHITE,
    });

    curY -= headerH;

    // Table rows
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i];
      const isAlt = i % 2 === 1;

      // Row background
      if (isAlt) {
        page.drawRectangle({
          x: MARGIN_L,
          y: curY - rowH + 12,
          width: CONTENT_W,
          height: rowH,
          color: BG,
        });
      }

      // Bottom border
      page.drawLine({
        start: { x: MARGIN_L, y: curY - rowH + 12 },
        end: { x: tableRight, y: curY - rowH + 12 },
        thickness: 0.5,
        color: rgb(0.95, 0.96, 0.96),
      });

      const textY = curY - 4;

      // Description (wrap if needed)
      const descLines = wrapText(item.description, fontR, 9, colQty - colDesc - 20);
      page.drawText(sanitize(descLines[0]), {
        x: colDesc + 12,
        y: textY,
        size: 9,
        font: fontR,
        color: DARK,
      });

      // Quantity
      const qtyStr = String(item.quantity);
      page.drawText(qtyStr, {
        x: colQty + (colUnit - colQty) / 2 - fontR.widthOfTextAtSize(qtyStr, 9) / 2,
        y: textY,
        size: 9,
        font: fontR,
        color: GRAY,
      });

      // Unit price
      const unitStr = fmtCurrency(item.unitPrice);
      page.drawText(sanitize(unitStr), {
        x: colTotal - fontR.widthOfTextAtSize(sanitize(unitStr), 9) - 4,
        y: textY,
        size: 9,
        font: fontR,
        color: GRAY,
      });

      // Total
      const totalStr = fmtCurrency(item.total);
      page.drawText(sanitize(totalStr), {
        x: tableRight - fontB.widthOfTextAtSize(sanitize(totalStr), 9) - 8,
        y: textY,
        size: 9,
        font: fontB,
        color: DARK,
      });

      curY -= rowH;
    }

    curY -= 8;

    // ═══════ 7. TOTALS ═══════
    const totalsW = 220;
    const totalsX = tableRight - totalsW;
    const totRowH = 22;

    // Sous-total row
    page.drawText("Sous-total HT", {
      x: totalsX,
      y: curY,
      size: 9,
      font: fontR,
      color: GRAY,
    });
    const subtotalStr = sanitize(fmtCurrency(invoice.subtotal));
    page.drawText(subtotalStr, {
      x: tableRight - fontR.widthOfTextAtSize(subtotalStr, 9) - 8,
      y: curY,
      size: 9,
      font: fontR,
      color: DARK,
    });

    // Separator
    curY -= totRowH;
    page.drawLine({
      start: { x: totalsX, y: curY + 8 },
      end: { x: tableRight, y: curY + 8 },
      thickness: 0.5,
      color: rgb(0.95, 0.96, 0.96),
    });

    // TVA row
    const tvaLabel = `TVA (${invoice.taxRate}%)`;
    page.drawText(sanitize(tvaLabel), {
      x: totalsX,
      y: curY,
      size: 9,
      font: fontR,
      color: GRAY,
    });
    const taxStr = sanitize(fmtCurrency(invoice.tax));
    page.drawText(taxStr, {
      x: tableRight - fontR.widthOfTextAtSize(taxStr, 9) - 8,
      y: curY,
      size: 9,
      font: fontR,
      color: DARK,
    });

    curY -= totRowH + 6;

    // Total TTC in navy rectangle
    const ttcBoxH = 32;
    page.drawRectangle({
      x: totalsX,
      y: curY - 4,
      width: totalsW,
      height: ttcBoxH,
      color: NAVY,
    });

    page.drawText("TOTAL TTC", {
      x: totalsX + 14,
      y: curY + 6,
      size: 10,
      font: fontB,
      color: WHITE,
    });

    const totalTtcStr = sanitize(fmtCurrency(invoice.total));
    page.drawText(totalTtcStr, {
      x: tableRight - fontB.widthOfTextAtSize(totalTtcStr, 13) - 14,
      y: curY + 4,
      size: 13,
      font: fontB,
      color: WHITE,
    });

    curY -= ttcBoxH + 16;

    // ═══════ 8. PAYMENT INFO ═══════
    const paymentH = 34;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - paymentH + 18,
      width: CONTENT_W,
      height: paymentH,
      color: BG,
    });
    // Left border accent
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - paymentH + 18,
      width: 3,
      height: paymentH,
      color: NAVY,
    });

    let payX = MARGIN_L + 14;
    if (invoice.dueDate) {
      drawField(page, "ECHEANCE", fmtDate(invoice.dueDate), payX, curY, fontR, fontB);
      payX += 130;
    }

    // Status badge
    page.drawText("STATUT", {
      x: payX,
      y: curY,
      size: 7.5,
      font: fontR,
      color: GRAY,
    });

    const sLabel = statusLabel(invoice.status);
    let sColor: ReturnType<typeof rgb>;
    let sBg: ReturnType<typeof rgb>;
    let sBorder: ReturnType<typeof rgb>;
    switch (invoice.status) {
      case "paid":
        sColor = EMERALD;
        sBg = GREEN_BG;
        sBorder = GREEN_BORDER;
        break;
      case "sent":
        sColor = BLUE;
        sBg = BLUE_BG_BADGE;
        sBorder = BLUE_BORDER_BADGE;
        break;
      case "overdue":
        sColor = RED;
        sBg = RED_BG;
        sBorder = RED_BORDER;
        break;
      default:
        sColor = GRAY;
        sBg = GRAY_BG_BADGE;
        sBorder = GRAY_BORDER_BADGE;
    }
    drawBadge(page, sLabel, payX, curY - 14, fontB, sColor, sBg, sBorder);

    // ═══════ 9. FOOTER ═══════
    const footerY = 44;
    page.drawLine({
      start: { x: MARGIN_L, y: footerY + 14 },
      end: { x: PAGE_W - MARGIN_R, y: footerY + 14 },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });

    // Company info line
    const footerParts = [companyName];
    if (invoice.team.siret) footerParts.push(`SIRET : ${invoice.team.siret}`);
    if (invoice.team.address) footerParts.push(invoice.team.address);
    const cpCity = [invoice.team.postalCode, invoice.team.city].filter(Boolean).join(" ");
    if (cpCity) footerParts.push(cpCity);
    const footerLine1 = sanitize(footerParts.join(" \u2013 "));
    const footerLine1W = fontR.widthOfTextAtSize(footerLine1, 7);
    page.drawText(footerLine1, {
      x: PAGE_W / 2 - footerLine1W / 2,
      y: footerY,
      size: 7,
      font: fontR,
      color: GRAY,
    });

    if (invoice.team.phone) {
      const phoneLine = sanitize(`Tel. ${invoice.team.phone}`);
      const phoneW = fontR.widthOfTextAtSize(phoneLine, 7);
      page.drawText(phoneLine, {
        x: PAGE_W / 2 - phoneW / 2,
        y: footerY - 12,
        size: 7,
        font: fontR,
        color: GRAY,
      });
    }

    // Serialize
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Facture-${sanitize(safe(invoice.client.lastName, ""))}-${sanitize(safe(invoice.client.firstName, ""))}-${fmtDate(invoice.date).replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation du PDF" },
      { status: 500 }
    );
  }
}
