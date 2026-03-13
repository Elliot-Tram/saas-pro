import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";

function formatCurrencyPdf(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " \u20AC";
}

function formatDatePdf(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.userId },
    include: {
      items: true,
      client: true,
      user: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const blue = rgb(0.22, 0.4, 0.87);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const gray = rgb(0.45, 0.45, 0.45);
  const lightGray = rgb(0.92, 0.92, 0.92);
  const white = rgb(1, 1, 1);

  const marginLeft = 50;
  const marginRight = 50;
  const contentWidth = width - marginLeft - marginRight;
  let y = height - 50;

  // === HEADER ===
  // Company name / title
  page.drawText(invoice.user.company || invoice.user.name, {
    x: marginLeft,
    y,
    size: 18,
    font: fontBold,
    color: blue,
  });

  page.drawText("FACTURE", {
    x: width - marginRight - fontBold.widthOfTextAtSize("FACTURE", 22),
    y,
    size: 22,
    font: fontBold,
    color: darkGray,
  });

  y -= 20;

  // Company details
  const companyDetails = [
    invoice.user.name,
    invoice.user.address,
    [invoice.user.postalCode, invoice.user.city].filter(Boolean).join(" "),
    invoice.user.email,
    invoice.user.phone,
    invoice.user.siret ? `SIRET: ${invoice.user.siret}` : null,
  ].filter(Boolean) as string[];

  for (const line of companyDetails) {
    page.drawText(line, {
      x: marginLeft,
      y,
      size: 9,
      font: fontRegular,
      color: gray,
    });
    y -= 13;
  }

  // Invoice meta (right side)
  let metaY = height - 70;
  const metaLines = [
    { label: "N°", value: invoice.number },
    { label: "Date", value: formatDatePdf(invoice.date) },
    ...(invoice.dueDate
      ? [{ label: "Échéance", value: formatDatePdf(invoice.dueDate) }]
      : []),
    { label: "Statut", value: invoice.status === "paid" ? "Payée" : invoice.status === "sent" ? "Envoyée" : "Brouillon" },
  ];

  for (const meta of metaLines) {
    const labelText = `${meta.label}: `;
    const labelWidth = fontRegular.widthOfTextAtSize(labelText, 9);
    const valueWidth = fontBold.widthOfTextAtSize(meta.value, 9);
    const totalWidth = labelWidth + valueWidth;

    page.drawText(labelText, {
      x: width - marginRight - totalWidth,
      y: metaY,
      size: 9,
      font: fontRegular,
      color: gray,
    });
    page.drawText(meta.value, {
      x: width - marginRight - valueWidth,
      y: metaY,
      size: 9,
      font: fontBold,
      color: darkGray,
    });
    metaY -= 15;
  }

  // === CLIENT SECTION ===
  y -= 10;
  page.drawRectangle({
    x: marginLeft,
    y: y - 70,
    width: contentWidth,
    height: 80,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: lightGray,
    borderWidth: 1,
  });

  y -= 5;
  page.drawText("FACTURER À", {
    x: marginLeft + 15,
    y,
    size: 8,
    font: fontBold,
    color: gray,
  });

  y -= 16;
  page.drawText(`${invoice.client.firstName} ${invoice.client.lastName}`, {
    x: marginLeft + 15,
    y,
    size: 10,
    font: fontBold,
    color: darkGray,
  });

  const clientLines = [
    invoice.client.address,
    [invoice.client.postalCode, invoice.client.city].filter(Boolean).join(" "),
    invoice.client.email,
    invoice.client.phone,
  ].filter(Boolean) as string[];

  for (const line of clientLines) {
    y -= 14;
    page.drawText(line, {
      x: marginLeft + 15,
      y,
      size: 9,
      font: fontRegular,
      color: gray,
    });
  }

  // === ITEMS TABLE ===
  y -= 40;

  // Table header
  const colX = {
    description: marginLeft,
    quantity: marginLeft + contentWidth * 0.5,
    unitPrice: marginLeft + contentWidth * 0.65,
    total: marginLeft + contentWidth * 0.82,
  };

  page.drawRectangle({
    x: marginLeft,
    y: y - 5,
    width: contentWidth,
    height: 25,
    color: blue,
  });

  const headerY = y + 2;
  page.drawText("Description", {
    x: colX.description + 10,
    y: headerY,
    size: 9,
    font: fontBold,
    color: white,
  });
  page.drawText("Qté", {
    x: colX.quantity + 10,
    y: headerY,
    size: 9,
    font: fontBold,
    color: white,
  });
  page.drawText("Prix unitaire", {
    x: colX.unitPrice + 10,
    y: headerY,
    size: 9,
    font: fontBold,
    color: white,
  });
  page.drawText("Total HT", {
    x: colX.total + 10,
    y: headerY,
    size: 9,
    font: fontBold,
    color: white,
  });

  y -= 25;

  // Table rows
  for (let i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const rowY = y - 5;

    if (i % 2 === 0) {
      page.drawRectangle({
        x: marginLeft,
        y: rowY - 5,
        width: contentWidth,
        height: 22,
        color: rgb(0.98, 0.98, 0.98),
      });
    }

    page.drawText(item.description, {
      x: colX.description + 10,
      y: rowY + 2,
      size: 9,
      font: fontRegular,
      color: darkGray,
      maxWidth: contentWidth * 0.45,
    });
    page.drawText(item.quantity.toString(), {
      x: colX.quantity + 10,
      y: rowY + 2,
      size: 9,
      font: fontRegular,
      color: darkGray,
    });
    page.drawText(formatCurrencyPdf(item.unitPrice), {
      x: colX.unitPrice + 10,
      y: rowY + 2,
      size: 9,
      font: fontRegular,
      color: darkGray,
    });
    page.drawText(formatCurrencyPdf(item.total), {
      x: colX.total + 10,
      y: rowY + 2,
      size: 9,
      font: fontBold,
      color: darkGray,
    });

    y -= 22;
  }

  // === TOTALS ===
  y -= 15;

  // Line separator
  page.drawLine({
    start: { x: marginLeft + contentWidth * 0.55, y: y + 5 },
    end: { x: marginLeft + contentWidth, y: y + 5 },
    thickness: 1,
    color: lightGray,
  });

  // Subtotal
  const totalsX = marginLeft + contentWidth * 0.6;
  const totalsValueX = marginLeft + contentWidth * 0.82 + 10;

  page.drawText("Sous-total HT", {
    x: totalsX,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(formatCurrencyPdf(invoice.subtotal), {
    x: totalsValueX,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 18;
  page.drawText(`TVA (${invoice.taxRate}%)`, {
    x: totalsX,
    y,
    size: 9,
    font: fontRegular,
    color: gray,
  });
  page.drawText(formatCurrencyPdf(invoice.tax), {
    x: totalsValueX,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });

  y -= 22;
  page.drawRectangle({
    x: marginLeft + contentWidth * 0.55,
    y: y - 8,
    width: contentWidth * 0.45,
    height: 28,
    color: blue,
  });

  page.drawText("TOTAL TTC", {
    x: totalsX,
    y: y - 1,
    size: 10,
    font: fontBold,
    color: white,
  });
  page.drawText(formatCurrencyPdf(invoice.total), {
    x: totalsValueX,
    y: y - 1,
    size: 11,
    font: fontBold,
    color: white,
  });

  // === FOOTER ===
  const footerY = 40;
  const footerText = invoice.user.siret
    ? `${invoice.user.company || invoice.user.name} — SIRET: ${invoice.user.siret}`
    : invoice.user.company || invoice.user.name;
  const footerWidth = fontRegular.widthOfTextAtSize(footerText, 8);

  page.drawText(footerText, {
    x: (width - footerWidth) / 2,
    y: footerY,
    size: 8,
    font: fontRegular,
    color: gray,
  });

  // Serialize PDF
  const pdfBytes = await pdfDoc.save();

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
    },
  });
}
