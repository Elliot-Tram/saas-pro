import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

// ── Color Palette ──────────────────────────────────────────────────────────────
const BLUE = rgb(0.16, 0.29, 0.55);
const BLUE_LIGHT = rgb(0.16, 0.29, 0.55);
const DARK = rgb(0.13, 0.13, 0.13);
const GRAY = rgb(0.45, 0.45, 0.45);
const GRAY_LIGHT = rgb(0.7, 0.7, 0.7);
const GRAY_BG = rgb(0.97, 0.97, 0.97);
const GRAY_BORDER = rgb(0.85, 0.85, 0.85);
const GREEN = rgb(0.13, 0.55, 0.13);
const RED = rgb(0.75, 0.15, 0.15);
const ORANGE = rgb(0.82, 0.52, 0.08);
const WHITE = rgb(1, 1, 1);

// ── Label translations ─────────────────────────────────────────────────────────
const labels: Record<string, string> = {
  mecanique_haut: "Mécanique par le haut",
  mecanique_bas: "Mécanique par le bas",
  chimique: "Chimique",
  mixte: "Mixte",
  bon_etat: "Bon état",
  a_surveiller: "À surveiller",
  dangereux: "Dangereux",
  proprietaire: "Propriétaire",
  locataire: "Locataire",
  syndic: "Syndic",
  annuel: "Annuel",
  semestriel: "Semestriel",
  anomaly_distance_plancher:
    "Distance de sécurité aux traversées de plancher non conforme",
  anomaly_distance_toiture:
    "Distance de sécurité au niveau de la toiture non conforme",
  anomaly_etancheite: "Défaut d'étanchéité du conduit",
  anomaly_coudes: "Coudes non conformes (>2 coudes à 90° par DTU 24.1)",
  anomaly_souche: "Souche de cheminée défectueuse",
  anomaly_section_horizontale: "Section horizontale excessive (>3m)",
  anomaly_plaque: "Absence de plaque signalétique",
  anomaly_bistre: "Présence de bistre importante",
  anomaly_autre: "Autre anomalie",
};

function t(key: string | null | undefined): string {
  if (!key) return "—";
  return labels[key] || key;
}

function safe(val: string | null | undefined, fallback = "—"): string {
  return val && val.trim() ? val.trim() : fallback;
}

function fmtDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ── Helper: embed a base64 image (PNG or JPG) safely ────────────────────────
async function embedBase64Image(
  pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>,
  dataUrl: string
) {
  const base64Data = dataUrl.split(",")[1];
  if (!base64Data) return null;
  const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
    c.charCodeAt(0)
  );
  const isPng = dataUrl.includes("image/png");
  return isPng ? pdfDoc.embedPng(imageBytes) : pdfDoc.embedJpg(imageBytes);
}

// ── Helper: draw centered text ──────────────────────────────────────────────
function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  pageWidth: number
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (pageWidth - w) / 2, y, size, font, color });
}

// ── Helper: draw right-aligned text ─────────────────────────────────────────
function drawRight(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: ReturnType<typeof rgb>,
  rightX: number
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: rightX - w, y, size, font, color });
}

// ── Helper: section header with blue accent bar ─────────────────────────────
function drawSectionHeader(
  page: PDFPage,
  title: string,
  y: number,
  fontB: PDFFont,
  leftX: number
): number {
  // Small blue accent rectangle
  page.drawRectangle({
    x: leftX,
    y: y - 2,
    width: 3,
    height: 12,
    color: BLUE,
  });
  page.drawText(title, {
    x: leftX + 10,
    y,
    size: 9,
    font: fontB,
    color: BLUE,
  });
  return y - 18;
}

// ── Helper: draw a labeled value ────────────────────────────────────────────
function drawLabelValue(
  page: PDFPage,
  label: string,
  value: string,
  x: number,
  y: number,
  fontR: PDFFont,
  fontB: PDFFont,
  valueSize = 9
): number {
  page.drawText(label, { x, y, size: 8, font: fontR, color: GRAY });
  page.drawText(value, {
    x,
    y: y - 12,
    size: valueSize,
    font: fontB,
    color: DARK,
  });
  return y - 28;
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
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const cert = await prisma.certificate.findFirst({
    where: { id, userId: session.userId },
    include: { client: true, user: true },
  });
  if (!cert)
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width } = page.getSize();
  const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontI = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const marginL = 45;
  const marginR = 45;
  const contentW = width - marginL - marginR;
  const col2X = marginL + contentW / 2 + 10;

  // ════════════════════════════════════════════════════════════════════════════
  // 1. TOP ACCENT BAR
  // ════════════════════════════════════════════════════════════════════════════
  page.drawRectangle({
    x: 0,
    y: 842 - 6,
    width,
    height: 6,
    color: BLUE,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. HEADER AREA (y: 790 to ~720)
  // ════════════════════════════════════════════════════════════════════════════
  let headerY = 790;
  let logoEndX = marginL;

  // Logo
  if (cert.user.logo) {
    try {
      const img = await embedBase64Image(pdfDoc, cert.user.logo);
      if (img) {
        const maxH = 55;
        const scale = maxH / img.height;
        const w = img.width * scale;
        page.drawImage(img, {
          x: marginL,
          y: headerY - maxH + 8,
          width: w,
          height: maxH,
        });
        logoEndX = marginL + w + 12;
      }
    } catch {
      /* skip invalid logo */
    }
  }

  // Company info (left side)
  const companyX = logoEndX;
  page.drawText(safe(cert.user.company || cert.user.name, "Entreprise"), {
    x: companyX,
    y: headerY,
    size: 14,
    font: fontB,
    color: BLUE,
  });

  let infoY = headerY - 15;
  const companyLines = [
    cert.user.address,
    [cert.user.postalCode, cert.user.city].filter(Boolean).join(" "),
    cert.user.phone,
    cert.user.email,
  ].filter(Boolean) as string[];

  for (const line of companyLines) {
    page.drawText(line, {
      x: companyX,
      y: infoY,
      size: 8,
      font: fontR,
      color: GRAY,
    });
    infoY -= 12;
  }

  // Title block (right side)
  const titleText = "CERTIFICAT DE RAMONAGE";
  drawRight(page, titleText, headerY, fontB, 20, DARK, width - marginR);

  const certNumber = safe(cert.number, "—");
  drawRight(
    page,
    `N° ${certNumber}`,
    headerY - 22,
    fontR,
    10,
    GRAY,
    width - marginR
  );
  drawRight(
    page,
    `Date : ${fmtDate(cert.date)}`,
    headerY - 36,
    fontR,
    9,
    GRAY,
    width - marginR
  );

  // ════════════════════════════════════════════════════════════════════════════
  // 3. SEPARATOR LINE
  // ════════════════════════════════════════════════════════════════════════════
  const sepY = 712;
  page.drawLine({
    start: { x: marginL, y: sepY },
    end: { x: width - marginR, y: sepY },
    thickness: 0.5,
    color: GRAY_BORDER,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. PROFESSIONAL INFO BAR
  // ════════════════════════════════════════════════════════════════════════════
  const proBarY = 697;
  page.drawRectangle({
    x: marginL,
    y: proBarY - 5,
    width: contentW,
    height: 18,
    color: GRAY_BG,
  });

  const proParts = [
    cert.user.siret ? `SIRET : ${cert.user.siret}` : null,
    cert.user.insurerName
      ? `Assurance RC : ${cert.user.insurerName}${cert.user.insuranceNumber ? ` — Police n°${cert.user.insuranceNumber}` : ""}`
      : null,
    cert.user.qualification
      ? `Qualification : ${cert.user.qualification}`
      : null,
  ].filter(Boolean) as string[];

  const proText = proParts.join("  |  ");
  if (proText) {
    drawCentered(page, proText, proBarY, fontR, 7.5, GRAY, width);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 5. CLIENT BOX
  // ════════════════════════════════════════════════════════════════════════════
  let y = 670;

  // Background box
  page.drawRectangle({
    x: marginL,
    y: y - 60,
    width: contentW,
    height: 68,
    color: GRAY_BG,
  });

  // Section label
  page.drawText("CLIENT", {
    x: marginL + 10,
    y: y,
    size: 8,
    font: fontB,
    color: BLUE,
  });

  // Client details - left side
  const clientName = `${safe(cert.client.firstName, "")} ${safe(cert.client.lastName, "")}`.trim() || "—";
  page.drawText(clientName, {
    x: marginL + 10,
    y: y - 16,
    size: 10,
    font: fontB,
    color: DARK,
  });

  page.drawText(t(cert.clientQuality), {
    x: marginL + 10,
    y: y - 30,
    size: 9,
    font: fontR,
    color: DARK,
  });

  const clientAddr = [
    cert.client.address,
    [cert.client.postalCode, cert.client.city].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");
  page.drawText(safe(clientAddr), {
    x: marginL + 10,
    y: y - 44,
    size: 9,
    font: fontR,
    color: DARK,
  });

  // Client details - right side
  let clientRightY = y - 16;
  if (cert.client.phone) {
    page.drawText("Tél.", {
      x: col2X,
      y: clientRightY,
      size: 8,
      font: fontR,
      color: GRAY,
    });
    page.drawText(cert.client.phone, {
      x: col2X + 30,
      y: clientRightY,
      size: 9,
      font: fontR,
      color: DARK,
    });
    clientRightY -= 16;
  }
  if (cert.client.email) {
    page.drawText("Email", {
      x: col2X,
      y: clientRightY,
      size: 8,
      font: fontR,
      color: GRAY,
    });
    page.drawText(cert.client.email, {
      x: col2X + 30,
      y: clientRightY,
      size: 9,
      font: fontR,
      color: DARK,
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 6. INSTALLATION BOX
  // ════════════════════════════════════════════════════════════════════════════
  y = 595;

  // Thin border box
  page.drawRectangle({
    x: marginL,
    y: y - 75,
    width: contentW,
    height: 85,
    borderColor: GRAY_BORDER,
    borderWidth: 0.5,
    color: WHITE,
  });

  // Header accent
  y = drawSectionHeader(page, "INSTALLATION", y, fontB, marginL + 8);

  // Column 1 fields
  let instY1 = y;
  // Type d'appareil
  page.drawText("Type d'appareil", {
    x: marginL + 12,
    y: instY1,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(safe(cert.chimneyType), {
    x: marginL + 95,
    y: instY1,
    size: 9,
    font: fontB,
    color: DARK,
  });
  instY1 -= 18;

  // Marque / Modele
  const brandModel = [cert.applianceBrand, cert.applianceModel]
    .filter(Boolean)
    .join(" — ");
  page.drawText("Marque / Modèle", {
    x: marginL + 12,
    y: instY1,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(safe(brandModel), {
    x: marginL + 95,
    y: instY1,
    size: 9,
    font: fontR,
    color: DARK,
  });
  instY1 -= 18;

  // Combustible
  page.drawText("Combustible", {
    x: marginL + 12,
    y: instY1,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(safe(cert.fuelType), {
    x: marginL + 95,
    y: instY1,
    size: 9,
    font: fontR,
    color: DARK,
  });

  // Column 2 fields
  let instY2 = y;
  const instCol2 = col2X + 10;

  page.drawText("Type de conduit", {
    x: instCol2,
    y: instY2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(safe(cert.conduitType), {
    x: instCol2 + 85,
    y: instY2,
    size: 9,
    font: fontR,
    color: DARK,
  });
  instY2 -= 18;

  page.drawText("Diamètre", {
    x: instCol2,
    y: instY2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(
    cert.conduitDiameter ? `Ø ${cert.conduitDiameter}` : "—",
    {
      x: instCol2 + 85,
      y: instY2,
      size: 9,
      font: fontR,
      color: DARK,
    }
  );

  // Longueur on same line further right (or next line if needed)
  const dimDetailX = instCol2 + 150;
  page.drawText("Long.", {
    x: dimDetailX,
    y: instY2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(cert.conduitLength ? `${cert.conduitLength}` : "—", {
    x: dimDetailX + 32,
    y: instY2,
    size: 9,
    font: fontR,
    color: DARK,
  });
  instY2 -= 18;

  page.drawText("Localisation", {
    x: instCol2,
    y: instY2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(safe(cert.chimneyLocation), {
    x: instCol2 + 85,
    y: instY2,
    size: 9,
    font: fontR,
    color: DARK,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. INTERVENTION & EVALUATION
  // ════════════════════════════════════════════════════════════════════════════
  y = 500;

  // Background
  page.drawRectangle({
    x: marginL,
    y: y - 75,
    width: contentW,
    height: 85,
    color: GRAY_BG,
  });

  y = drawSectionHeader(page, "INTERVENTION & ÉVALUATION", y, fontB, marginL + 8);

  // Method + Periodicity on same line
  page.drawText("Méthode", {
    x: marginL + 12,
    y,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(t(cert.method), {
    x: marginL + 60,
    y,
    size: 9,
    font: fontB,
    color: DARK,
  });

  page.drawText("Périodicité", {
    x: instCol2,
    y,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(t(cert.periodicity), {
    x: instCol2 + 60,
    y,
    size: 9,
    font: fontB,
    color: DARK,
  });

  y -= 24;

  // Vacuity result
  page.drawText("VACUITÉ DU CONDUIT", {
    x: marginL + 12,
    y: y + 2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  const vacLabel = cert.vacuumTest ? "CONFORME" : "NON CONFORME";
  const vacColor = cert.vacuumTest ? GREEN : RED;
  page.drawText(vacLabel, {
    x: marginL + 12,
    y: y - 14,
    size: 12,
    font: fontB,
    color: vacColor,
  });

  // General condition
  page.drawText("ÉTAT GÉNÉRAL", {
    x: instCol2,
    y: y + 2,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  const condColor =
    cert.condition === "bon_etat"
      ? GREEN
      : cert.condition === "a_surveiller"
        ? ORANGE
        : RED;
  page.drawText(t(cert.condition).toUpperCase(), {
    x: instCol2,
    y: y - 14,
    size: 12,
    font: fontB,
    color: condColor,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 8. ANOMALIES
  // ════════════════════════════════════════════════════════════════════════════
  y = 410;
  const anomalies = (cert.anomalies as string[] | null) || [];

  // Calculate height needed
  const anomalyLineH = 15;
  const anomalyContentH =
    anomalies.length === 0 ? 20 : anomalies.length * anomalyLineH;
  const anomalyBoxH = anomalyContentH + 24;

  page.drawRectangle({
    x: marginL,
    y: y - anomalyBoxH + 12,
    width: contentW,
    height: anomalyBoxH,
    borderColor: GRAY_BORDER,
    borderWidth: 0.5,
    color: WHITE,
  });

  y = drawSectionHeader(
    page,
    "ANOMALIES CONSTATÉES",
    y,
    fontB,
    marginL + 8
  );

  if (anomalies.length === 0) {
    // Checkmark + green text
    page.drawText("OK", {
      x: marginL + 12,
      y,
      size: 9,
      font: fontB,
      color: GREEN,
    });
    page.drawText("Aucune anomalie constatee", {
      x: marginL + 30,
      y,
      size: 9,
      font: fontB,
      color: GREEN,
    });
    y -= 20;
  } else {
    for (const a of anomalies) {
      // Red bullet
      page.drawRectangle({
        x: marginL + 14,
        y: y + 2,
        width: 4,
        height: 4,
        color: RED,
      });
      page.drawText(t(a), {
        x: marginL + 24,
        y,
        size: 8.5,
        font: fontR,
        color: RED,
      });
      y -= anomalyLineH;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 9. OBSERVATIONS & RECOMMANDATIONS
  // ════════════════════════════════════════════════════════════════════════════
  if (cert.observations || cert.recommendations || cert.nextVisit) {
    y -= 8;

    // Pre-calculate content to determine box height
    const obsLines = cert.observations
      ? wrapText(cert.observations, fontR, 8.5, contentW - 30)
      : [];
    const recLines = cert.recommendations
      ? wrapText(cert.recommendations, fontI, 8.5, contentW - 30)
      : [];
    const totalLines =
      obsLines.length +
      (cert.recommendations ? recLines.length + 1 : 0) +
      (cert.nextVisit ? 2 : 0);
    const obsBoxH = totalLines * 13 + 28;

    page.drawRectangle({
      x: marginL,
      y: y - obsBoxH + 12,
      width: contentW,
      height: obsBoxH,
      color: GRAY_BG,
    });

    y = drawSectionHeader(
      page,
      "OBSERVATIONS & RECOMMANDATIONS",
      y,
      fontB,
      marginL + 8
    );

    // Observations text
    if (cert.observations) {
      for (const line of obsLines) {
        page.drawText(line, {
          x: marginL + 12,
          y,
          size: 8.5,
          font: fontR,
          color: DARK,
        });
        y -= 13;
      }
      y -= 4;
    }

    // Recommendations in italic
    if (cert.recommendations) {
      page.drawText("Recommandations :", {
        x: marginL + 12,
        y,
        size: 8,
        font: fontB,
        color: GRAY,
      });
      y -= 13;
      for (const line of recLines) {
        page.drawText(line, {
          x: marginL + 12,
          y,
          size: 8.5,
          font: fontI,
          color: DARK,
        });
        y -= 13;
      }
    }

    // Next visit
    if (cert.nextVisit) {
      y -= 4;
      page.drawText(
        `Prochain passage recommandé : ${fmtDate(cert.nextVisit)}`,
        {
          x: marginL + 12,
          y,
          size: 9,
          font: fontB,
          color: BLUE,
        }
      );
      y -= 16;
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 10. SIGNATURES
  // ════════════════════════════════════════════════════════════════════════════
  const sigAreaTop = Math.min(y - 20, 165);

  // Horizontal separator line
  page.drawLine({
    start: { x: marginL, y: sigAreaTop + 75 },
    end: { x: width - marginR, y: sigAreaTop + 75 },
    thickness: 0.5,
    color: GRAY_BORDER,
  });

  const sigBoxW = 220;
  const sigBoxH = 60;
  const proSigX = marginL + 20;
  const clientSigX = width - marginR - sigBoxW - 20;

  // Pro signature
  page.drawText("Le professionnel", {
    x: proSigX,
    y: sigAreaTop + 58,
    size: 9,
    font: fontB,
    color: DARK,
  });

  // Dashed border effect (series of short lines)
  const dashLen = 4;
  const gapLen = 3;
  const drawDashedRect = (
    rx: number,
    ry: number,
    rw: number,
    rh: number
  ) => {
    // Top
    for (let dx = 0; dx < rw; dx += dashLen + gapLen) {
      const end = Math.min(dx + dashLen, rw);
      page.drawLine({
        start: { x: rx + dx, y: ry + rh },
        end: { x: rx + end, y: ry + rh },
        thickness: 0.5,
        color: GRAY_LIGHT,
      });
    }
    // Bottom
    for (let dx = 0; dx < rw; dx += dashLen + gapLen) {
      const end = Math.min(dx + dashLen, rw);
      page.drawLine({
        start: { x: rx + dx, y: ry },
        end: { x: rx + end, y: ry },
        thickness: 0.5,
        color: GRAY_LIGHT,
      });
    }
    // Left
    for (let dy = 0; dy < rh; dy += dashLen + gapLen) {
      const end = Math.min(dy + dashLen, rh);
      page.drawLine({
        start: { x: rx, y: ry + dy },
        end: { x: rx, y: ry + end },
        thickness: 0.5,
        color: GRAY_LIGHT,
      });
    }
    // Right
    for (let dy = 0; dy < rh; dy += dashLen + gapLen) {
      const end = Math.min(dy + dashLen, rh);
      page.drawLine({
        start: { x: rx + rw, y: ry + dy },
        end: { x: rx + rw, y: ry + end },
        thickness: 0.5,
        color: GRAY_LIGHT,
      });
    }
  };

  drawDashedRect(proSigX, sigAreaTop - 5, sigBoxW, sigBoxH);

  // Embed pro signature image
  if (cert.proSignature) {
    try {
      const sigImg = await embedBase64Image(pdfDoc, cert.proSignature);
      if (sigImg) {
        const scale = Math.min(
          (sigBoxW - 20) / sigImg.width,
          (sigBoxH - 10) / sigImg.height
        );
        const sw = sigImg.width * scale;
        const sh = sigImg.height * scale;
        page.drawImage(sigImg, {
          x: proSigX + (sigBoxW - sw) / 2,
          y: sigAreaTop - 5 + (sigBoxH - sh) / 2,
          width: sw,
          height: sh,
        });
      }
    } catch {
      /* skip invalid signature */
    }
  }

  // Pro name + date below box
  page.drawText(
    safe(cert.user.company || cert.user.name, ""),
    {
      x: proSigX,
      y: sigAreaTop - 18,
      size: 8,
      font: fontR,
      color: GRAY,
    }
  );
  page.drawText(`Date : ${fmtDate(cert.date)}`, {
    x: proSigX,
    y: sigAreaTop - 30,
    size: 7.5,
    font: fontR,
    color: GRAY,
  });

  // Client signature
  page.drawText("Le client", {
    x: clientSigX,
    y: sigAreaTop + 58,
    size: 9,
    font: fontB,
    color: DARK,
  });

  drawDashedRect(clientSigX, sigAreaTop - 5, sigBoxW, sigBoxH);

  // Embed client signature image
  if (cert.clientSignature) {
    try {
      const sigImg = await embedBase64Image(pdfDoc, cert.clientSignature);
      if (sigImg) {
        const scale = Math.min(
          (sigBoxW - 20) / sigImg.width,
          (sigBoxH - 10) / sigImg.height
        );
        const sw = sigImg.width * scale;
        const sh = sigImg.height * scale;
        page.drawImage(sigImg, {
          x: clientSigX + (sigBoxW - sw) / 2,
          y: sigAreaTop - 5 + (sigBoxH - sh) / 2,
          width: sw,
          height: sh,
        });
      }
    } catch {
      /* skip invalid signature */
    }
  }

  // Client name + date below box
  page.drawText(clientName, {
    x: clientSigX,
    y: sigAreaTop - 18,
    size: 8,
    font: fontR,
    color: GRAY,
  });
  page.drawText(`Date : ${fmtDate(cert.date)}`, {
    x: clientSigX,
    y: sigAreaTop - 30,
    size: 7.5,
    font: fontR,
    color: GRAY,
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 11. LEGAL FOOTER
  // ════════════════════════════════════════════════════════════════════════════
  const footerY = 36;

  // Thin separator
  page.drawLine({
    start: { x: marginL + 60, y: footerY + 14 },
    end: { x: width - marginR - 60, y: footerY + 14 },
    thickness: 0.3,
    color: GRAY_BORDER,
  });

  const legal1 =
    "Établi conformément au décret n°2023-641 du 20 juillet 2023";
  drawCentered(page, legal1, footerY + 4, fontR, 7, GRAY, width);

  const validityText = t(cert.periodicity).toLowerCase();
  const legal2 = `Ce document doit être conservé pendant une durée minimale de 2 ans — Validité : ${validityText}`;
  drawCentered(page, legal2, footerY - 6, fontR, 7, GRAY, width);

  // ════════════════════════════════════════════════════════════════════════════
  // EXPORT PDF
  // ════════════════════════════════════════════════════════════════════════════
  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificat-${cert.number}.pdf"`,
    },
  });
}
