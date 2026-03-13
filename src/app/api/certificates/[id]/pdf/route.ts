import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextRequest } from "next/server";

const conditionLabels: Record<string, string> = {
  bon_etat: "Bon état",
  a_surveiller: "À surveiller",
  dangereux: "Dangereux",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: { id, userId: session.userId },
    include: { client: true },
  });

  if (!certificate) {
    return new Response("Not found", { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const darkColor = rgb(0.13, 0.13, 0.13);
  const grayColor = rgb(0.4, 0.4, 0.4);
  const blueColor = rgb(0.2, 0.4, 0.7);
  const lightGray = rgb(0.92, 0.92, 0.92);

  const marginLeft = 50;
  const marginRight = width - 50;
  const contentWidth = marginRight - marginLeft;
  let y = height - 50;

  // --- Header line ---
  page.drawRectangle({
    x: marginLeft,
    y: y - 4,
    width: contentWidth,
    height: 3,
    color: blueColor,
  });
  y -= 30;

  // --- Title ---
  const title = "CERTIFICAT DE RAMONAGE";
  const titleWidth = fontBold.widthOfTextAtSize(title, 22);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y,
    size: 22,
    font: fontBold,
    color: darkColor,
  });
  y -= 25;

  // --- Certificate number and date ---
  const subtitle = `N° ${certificate.number}  —  ${formatDate(certificate.date)}`;
  const subtitleWidth = fontRegular.widthOfTextAtSize(subtitle, 11);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y,
    size: 11,
    font: fontRegular,
    color: grayColor,
  });
  y -= 40;

  // --- Helper to draw a section ---
  function drawSectionTitle(label: string) {
    page.drawRectangle({
      x: marginLeft,
      y: y - 3,
      width: contentWidth,
      height: 22,
      color: lightGray,
    });
    page.drawText(label, {
      x: marginLeft + 10,
      y: y + 2,
      size: 11,
      font: fontBold,
      color: darkColor,
    });
    y -= 28;
  }

  function drawField(label: string, value: string) {
    page.drawText(label, {
      x: marginLeft + 10,
      y,
      size: 9,
      font: fontRegular,
      color: grayColor,
    });
    page.drawText(value, {
      x: marginLeft + 180,
      y,
      size: 10,
      font: fontRegular,
      color: darkColor,
    });
    y -= 18;
  }

  // --- Professional Info ---
  drawSectionTitle("PROFESSIONNEL");
  drawField("Nom", user.name);
  if (user.company) drawField("Entreprise", user.company);
  if (user.siret) drawField("SIRET", user.siret);
  if (user.address) {
    const fullAddress = [user.address, user.postalCode, user.city]
      .filter(Boolean)
      .join(", ");
    drawField("Adresse", fullAddress);
  }
  if (user.phone) drawField("Téléphone", user.phone);
  y -= 10;

  // --- Client Info ---
  drawSectionTitle("CLIENT");
  drawField("Nom", `${certificate.client.firstName} ${certificate.client.lastName}`);
  const clientAddress = [
    certificate.client.address,
    certificate.client.postalCode,
    certificate.client.city,
  ]
    .filter(Boolean)
    .join(", ");
  drawField("Adresse", clientAddress);
  if (certificate.client.phone) drawField("Téléphone", certificate.client.phone);
  if (certificate.client.email) drawField("Email", certificate.client.email);
  y -= 10;

  // --- Chimney Details ---
  drawSectionTitle("DÉTAILS DU CONDUIT");
  drawField("Type de cheminée", certificate.chimneyType);
  if (certificate.chimneyLocation) drawField("Emplacement", certificate.chimneyLocation);
  if (certificate.fuelType) drawField("Combustible", certificate.fuelType);
  y -= 10;

  // --- Assessment ---
  drawSectionTitle("ÉVALUATION");
  drawField("État du conduit", conditionLabels[certificate.condition] || certificate.condition);
  drawField("Test de vacuité", certificate.vacuumTest ? "Conforme" : "Non conforme");
  if (certificate.observations) {
    page.drawText("Observations :", {
      x: marginLeft + 10,
      y,
      size: 9,
      font: fontRegular,
      color: grayColor,
    });
    y -= 16;

    // Word-wrap observations
    const maxLineWidth = contentWidth - 20;
    const words = certificate.observations.split(" ");
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = fontRegular.widthOfTextAtSize(testLine, 10);
      if (testWidth > maxLineWidth && currentLine) {
        page.drawText(currentLine, {
          x: marginLeft + 10,
          y,
          size: 10,
          font: fontRegular,
          color: darkColor,
        });
        y -= 15;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      page.drawText(currentLine, {
        x: marginLeft + 10,
        y,
        size: 10,
        font: fontRegular,
        color: darkColor,
      });
      y -= 15;
    }
  }
  y -= 10;

  // --- Next Visit ---
  if (certificate.nextVisit) {
    drawSectionTitle("PROCHAINE VISITE RECOMMANDÉE");
    drawField("Date", formatDate(certificate.nextVisit));
    y -= 10;
  }

  // --- Signature area ---
  y -= 10;
  page.drawText("Signature du professionnel", {
    x: marginLeft + 10,
    y,
    size: 10,
    font: fontBold,
    color: darkColor,
  });

  page.drawText("Signature du client", {
    x: marginLeft + contentWidth / 2 + 10,
    y,
    size: 10,
    font: fontBold,
    color: darkColor,
  });
  y -= 15;

  // Signature boxes
  page.drawRectangle({
    x: marginLeft + 10,
    y: y - 60,
    width: contentWidth / 2 - 30,
    height: 60,
    borderColor: lightGray,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });

  page.drawRectangle({
    x: marginLeft + contentWidth / 2 + 10,
    y: y - 60,
    width: contentWidth / 2 - 30,
    height: 60,
    borderColor: lightGray,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98),
  });

  y -= 80;

  // --- Legal notice ---
  page.drawRectangle({
    x: marginLeft,
    y: y - 5,
    width: contentWidth,
    height: 1,
    color: lightGray,
  });
  y -= 20;

  const legalText = "Certificat établi conformément à l'article 31-6 du RSDT";
  const legalWidth = fontRegular.widthOfTextAtSize(legalText, 8);
  page.drawText(legalText, {
    x: (width - legalWidth) / 2,
    y,
    size: 8,
    font: fontRegular,
    color: grayColor,
  });

  // Serialize
  const pdfBytes = await pdfDoc.save();

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificat-${certificate.number}.pdf"`,
    },
  });
}
