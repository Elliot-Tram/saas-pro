import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont, PDFImage } from "pdf-lib";

// ── Color palette ────────────────────────────────────────────────────────────
const NAVY = rgb(0.06, 0.17, 0.27);
const BLUE = rgb(0.15, 0.39, 0.93);
const EMERALD = rgb(0.02, 0.59, 0.41);
const RED = rgb(0.86, 0.15, 0.15);
const AMBER = rgb(0.85, 0.47, 0.02);
const DARK = rgb(0.07, 0.09, 0.11);
const GRAY = rgb(0.42, 0.45, 0.49);
const LIGHT_GRAY = rgb(0.9, 0.91, 0.92);
const BG = rgb(0.98, 0.98, 0.99);
const WHITE = rgb(1, 1, 1);

const EMERALD_BG = rgb(0.93, 0.99, 0.96);
const EMERALD_BORDER = rgb(0.65, 0.95, 0.82);
const RED_BG = rgb(1, 0.95, 0.95);
const RED_BORDER = rgb(0.99, 0.79, 0.79);
const AMBER_BG = rgb(1, 0.98, 0.92);
const AMBER_BORDER = rgb(0.99, 0.9, 0.54);
const BLUE_BG = rgb(0.94, 0.96, 1);
const BLUE_BORDER = rgb(0.75, 0.86, 0.99);

// ── Page dimensions (A4) ─────────────────────────────────────────────────────
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN_L = 44;
const MARGIN_R = 44;
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;

// ── Label translations ───────────────────────────────────────────────────────
const labels: Record<string, string> = {
  mecanique_haut: "M\u00e9canique par le haut",
  mecanique_bas: "M\u00e9canique par le bas",
  chimique: "Chimique",
  mixte: "Mixte",
  bon_etat: "Bon \u00e9tat",
  a_surveiller: "\u00c0 surveiller",
  dangereux: "Dangereux",
  proprietaire: "Propri\u00e9taire",
  locataire: "Locataire",
  syndic: "Syndic",
  annuel: "Annuel",
  semestriel: "Semestriel",
  anomaly_distance_plancher:
    "Distance de s\u00e9curit\u00e9 aux travers\u00e9es de plancher non conforme",
  anomaly_distance_toiture:
    "Distance de s\u00e9curit\u00e9 au niveau de la toiture non conforme",
  anomaly_etancheite: "D\u00e9faut d'\u00e9tanch\u00e9it\u00e9 du conduit",
  anomaly_coudes: "Coudes non conformes (>2 coudes \u00e0 90\u00b0 par DTU 24.1)",
  anomaly_section_horizontale: "Section horizontale excessive (>3m)",
  anomaly_plaque: "Absence de plaque signal\u00e9tique",
  anomaly_bistre: "Pr\u00e9sence de bistre importante",
  anomaly_autre: "Autre anomalie",
  anomaly_souche: "Souche de chemin\u00e9e d\u00e9fectueuse",
};

function t(key: string | null | undefined): string {
  if (!key) return "--";
  return labels[key] || key;
}

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

// ── Helper: sanitize text for Helvetica (WinAnsi/Latin-1 encoding) ──────────
// Helvetica supports all standard French accents (é, è, ê, à, ç, ô, etc.)
// Only replace characters outside WinAnsi encoding
function sanitize(str: string): string {
  return str
    .replace(/\u2014/g, "\u2013") // em dash → en dash (supported in WinAnsi)
    .replace(/\u2019/g, "\u2019") // right single quote (supported)
    .replace(/\u2018/g, "\u2018") // left single quote (supported)
    .replace(/\u201c/g, "\u00ab") // left double quote → guillemet
    .replace(/\u201d/g, "\u00bb") // right double quote → guillemet
    .replace(/\u00a0/g, " ")      // non-breaking space → space
    .replace(/\u20ac/g, "EUR");   // euro sign → EUR (not in all fonts)
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
  width: number,
  centerX?: number
): number {
  const text = sanitize(title.toUpperCase());
  const textX = centerX != null
    ? centerX - fontBold.widthOfTextAtSize(text, 8.5) / 2
    : MARGIN_L;
  page.drawText(text, {
    x: textX,
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
  const textWidth = font.widthOfTextAtSize(displayText, 10);
  const padding = 12;
  const height = 22;
  const width = textWidth + padding * 2;
  // Background
  page.drawRectangle({
    x,
    y: y - 5,
    width,
    height,
    color: bgColor,
  });
  // Border
  page.drawRectangle({
    x,
    y: y - 5,
    width,
    height,
    borderColor,
    borderWidth: 1.5,
    color: undefined,
    opacity: 0,
  });
  // Text
  page.drawText(displayText, {
    x: x + padding,
    y: y + 2,
    size: 10,
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
  const cert = await prisma.certificate.findFirst({
    where: { id, teamId: session.teamId },
    include: { client: true, team: true },
  });
  if (!cert)
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

    const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontI = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Embed images
    const logoImg = await embedImage(pdfDoc, cert.team.logo);
    const proSigImg = await embedImage(pdfDoc, cert.proSignature);
    const clientSigImg = await embedImage(pdfDoc, cert.clientSignature);

    // Derived data
    const clientName =
      `${safe(cert.client.firstName, "")} ${safe(cert.client.lastName, "")}`.trim() || "--";
    const clientAddr = [
      cert.client.address,
      [cert.client.postalCode, cert.client.city].filter(Boolean).join(" "),
    ]
      .filter(Boolean)
      .join(", ");

    const companyName = safe(
      cert.team.company || cert.team.name,
      "Entreprise"
    );
    const companyLines = [
      cert.team.address,
      [cert.team.postalCode, cert.team.city].filter(Boolean).join(" "),
      cert.team.phone ? `Tel. ${cert.team.phone}` : null,
    ].filter(Boolean) as string[];

    const proParts = [
      cert.team.siret ? `SIRET : ${cert.team.siret}` : null,
      cert.team.insurerName
        ? `Assurance RC : ${cert.team.insurerName}${cert.team.insuranceNumber ? ` \u2013 Police n\u00b0${cert.team.insuranceNumber}` : ""}`
        : null,
      cert.team.qualification
        ? `Qualification : ${cert.team.qualification}`
        : null,
    ].filter(Boolean) as string[];

    const anomalies = (cert.anomalies as string[] | null) || [];
    const brandModel = [cert.applianceBrand, cert.applianceModel]
      .filter(Boolean)
      .join(" \u2013 ");

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
    const titleText = "CERTIFICAT DE RAMONAGE";
    const titleWidth = fontB.widthOfTextAtSize(titleText, 18);
    page.drawText(titleText, {
      x: PAGE_W - MARGIN_R - titleWidth,
      y: curY + 2,
      size: 18,
      font: fontB,
      color: NAVY,
    });

    // Blue accent line under title
    page.drawLine({
      start: { x: PAGE_W - MARGIN_R - 40, y: curY - 8 },
      end: { x: PAGE_W - MARGIN_R, y: curY - 8 },
      thickness: 2,
      color: BLUE,
    });

    // Certificate number and date
    const numText = sanitize(`N\u00b0 ${safe(cert.number)}`);
    const numWidth = fontR.widthOfTextAtSize(numText, 9);
    page.drawText(numText, {
      x: PAGE_W - MARGIN_R - numWidth,
      y: curY - 20,
      size: 9,
      font: fontR,
      color: GRAY,
    });

    const dateText = sanitize(`Date : ${fmtDate(cert.date)}`);
    const dateWidth = fontR.widthOfTextAtSize(dateText, 9);
    page.drawText(dateText, {
      x: PAGE_W - MARGIN_R - dateWidth,
      y: curY - 32,
      size: 9,
      font: fontR,
      color: GRAY,
    });

    // ═══════ 3. SEPARATOR ═══════
    curY = PAGE_H - 115;
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
      const proBarX = MARGIN_L;
      const proBarW = CONTENT_W;
      page.drawRectangle({
        x: proBarX,
        y: curY - 6,
        width: proBarW,
        height: 18,
        color: BG,
      });
      page.drawText(proText, {
        x: proBarX + (proBarW - proWidth) / 2,
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
    curY = drawSectionHeader(page, "Client", curY, fontB, CONTENT_W);

    // Light gray background card
    const clientCardH = 62;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - clientCardH + 14,
      width: CONTENT_W,
      height: clientCardH,
      color: BG,
    });
    // Left border accent
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - clientCardH + 14,
      width: 3,
      height: clientCardH,
      color: LIGHT_GRAY,
    });

    const colMid = MARGIN_L + CONTENT_W / 2 + 10;

    // Client name (bold)
    page.drawText(sanitize(clientName), {
      x: MARGIN_L + 14,
      y: curY,
      size: 10,
      font: fontB,
      color: DARK,
    });

    // Quality
    let clientFieldY = curY - 16;
    if (cert.clientQuality) {
      drawField(page, "QUALITE", t(cert.clientQuality), MARGIN_L + 14, clientFieldY, fontR, fontB);
    }

    // Address
    drawField(page, "ADRESSE", safe(clientAddr), MARGIN_L + 14, clientFieldY - (cert.clientQuality ? 28 : 0), fontR, fontB);

    // Right column: phone & email
    let rightFieldY = curY;
    if (cert.client.phone) {
      rightFieldY = drawField(page, "TELEPHONE", cert.client.phone, colMid, rightFieldY, fontR, fontB);
    }
    if (cert.client.email) {
      drawField(page, "EMAIL", cert.client.email, colMid, rightFieldY, fontR, fontB);
    }

    curY -= clientCardH + 8;

    // ═══════ 6. INSTALLATION SECTION ═══════
    curY = drawSectionHeader(page, "Installation", curY, fontB, CONTENT_W);

    // Left border accent
    const installCardH = 78;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - installCardH + 14,
      width: 3,
      height: installCardH,
      color: LIGHT_GRAY,
    });

    // Left column
    let leftY = curY;
    leftY = drawField(page, "TYPE D'APPAREIL", safe(cert.chimneyType), MARGIN_L + 14, leftY, fontR, fontB, true);
    if (brandModel) {
      leftY = drawField(page, "MARQUE / MODELE", brandModel, MARGIN_L + 14, leftY, fontR, fontB);
    }
    drawField(page, "COMBUSTIBLE", safe(cert.fuelType), MARGIN_L + 14, leftY, fontR, fontB);

    // Right column
    let rightY = curY;
    rightY = drawField(page, "TYPE DE CONDUIT", safe(cert.conduitType), colMid, rightY, fontR, fontB);
    const diamStr = cert.conduitDiameter ? `diam. ${cert.conduitDiameter}` : "--";
    const lengthStr = cert.conduitLength ? ` \u2013 Long. ${cert.conduitLength}` : "";
    rightY = drawField(page, "DIAMETRE / LONGUEUR", `${diamStr}${lengthStr}`, colMid, rightY, fontR, fontB);
    drawField(page, "LOCALISATION", safe(cert.chimneyLocation), colMid, rightY, fontR, fontB);

    curY -= installCardH + 8;

    // ═══════ 7. INTERVENTION RESULTS ═══════
    curY = drawSectionHeader(page, "Resultat de l'intervention", curY, fontB, CONTENT_W);

    // Background card
    const interCardH = 92;
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - interCardH + 14,
      width: CONTENT_W,
      height: interCardH,
      color: BG,
    });
    page.drawRectangle({
      x: MARGIN_L,
      y: curY - interCardH + 14,
      width: 3,
      height: interCardH,
      color: LIGHT_GRAY,
    });

    // Method + Periodicity
    drawField(page, "METHODE", t(cert.method), MARGIN_L + 14, curY, fontR, fontB, true);
    drawField(page, "PERIODICITE", t(cert.periodicity), colMid, curY, fontR, fontB, true);

    // Separator line
    const sepY = curY - 30;
    page.drawLine({
      start: { x: MARGIN_L + 14, y: sepY },
      end: { x: PAGE_W - MARGIN_R - 10, y: sepY },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });

    // Vacuite badge row
    let badgeY = sepY - 20;
    const vacLabel = sanitize("VACUITE DU CONDUIT");
    page.drawText(vacLabel, {
      x: MARGIN_L + 14,
      y: badgeY + 3,
      size: 8,
      font: fontB,
      color: GRAY,
    });

    const vacText = cert.vacuumTest ? "CONFORME" : "NON CONFORME";
    const vacTextColor = cert.vacuumTest ? EMERALD : RED;
    const vacBg = cert.vacuumTest ? EMERALD_BG : RED_BG;
    const vacBorder = cert.vacuumTest ? EMERALD_BORDER : RED_BORDER;
    drawBadge(page, vacText, PAGE_W - MARGIN_R - fontB.widthOfTextAtSize(sanitize(vacText), 10) - 34, badgeY - 5, fontB, vacTextColor, vacBg, vacBorder);

    // Etat badge row
    badgeY -= 28;
    const etatLabel = sanitize("ETAT GENERAL");
    page.drawText(etatLabel, {
      x: MARGIN_L + 14,
      y: badgeY + 3,
      size: 8,
      font: fontB,
      color: GRAY,
    });

    const condText = t(cert.condition).toUpperCase();
    const condTextColor =
      cert.condition === "bon_etat" ? EMERALD : cert.condition === "a_surveiller" ? AMBER : RED;
    const condBg =
      cert.condition === "bon_etat" ? EMERALD_BG : cert.condition === "a_surveiller" ? AMBER_BG : RED_BG;
    const condBorder =
      cert.condition === "bon_etat" ? EMERALD_BORDER : cert.condition === "a_surveiller" ? AMBER_BORDER : RED_BORDER;
    drawBadge(page, condText, PAGE_W - MARGIN_R - fontB.widthOfTextAtSize(sanitize(condText), 10) - 34, badgeY - 5, fontB, condTextColor, condBg, condBorder);

    curY -= interCardH + 8;

    // ═══════ 8. ANOMALIES ═══════
    curY = drawSectionHeader(page, "Anomalies constatees", curY, fontB, CONTENT_W);

    page.drawRectangle({
      x: MARGIN_L,
      y: curY - (anomalies.length === 0 ? 16 : anomalies.length * 16 + 4),
      width: 3,
      height: anomalies.length === 0 ? 30 : anomalies.length * 16 + 18,
      color: anomalies.length === 0 ? EMERALD : RED,
    });

    if (anomalies.length === 0) {
      page.drawText(sanitize("Aucune anomalie constatee"), {
        x: MARGIN_L + 14,
        y: curY,
        size: 10,
        font: fontB,
        color: EMERALD,
      });
      curY -= 30;
    } else {
      for (const a of anomalies) {
        // Red bullet
        page.drawCircle({
          x: MARGIN_L + 18,
          y: curY + 3,
          size: 3,
          color: RED,
        });
        page.drawText(sanitize(t(a)), {
          x: MARGIN_L + 28,
          y: curY,
          size: 9,
          font: fontB,
          color: RED,
        });
        curY -= 16;
      }
      curY -= 8;
    }

    // ═══════ 9. OBSERVATIONS ═══════
    if (cert.observations || cert.recommendations || cert.nextVisit) {
      curY -= 4;
      curY = drawSectionHeader(page, "Observations & Recommandations", curY, fontB, CONTENT_W);

      page.drawRectangle({
        x: MARGIN_L,
        y: curY - 2,
        width: 3,
        height: 14,
        color: LIGHT_GRAY,
      });

      if (cert.observations) {
        const obsLines = wrapText(cert.observations, fontR, 9, CONTENT_W - 28);
        for (const line of obsLines) {
          page.drawText(sanitize(line), {
            x: MARGIN_L + 14,
            y: curY,
            size: 9,
            font: fontR,
            color: DARK,
          });
          curY -= 13;
        }
        curY -= 4;
      }

      if (cert.recommendations) {
        page.drawText("RECOMMANDATIONS", {
          x: MARGIN_L + 14,
          y: curY,
          size: 7.5,
          font: fontB,
          color: GRAY,
        });
        curY -= 13;
        const recLines = wrapText(cert.recommendations, fontI, 9, CONTENT_W - 28);
        for (const line of recLines) {
          page.drawText(sanitize(line), {
            x: MARGIN_L + 14,
            y: curY,
            size: 9,
            font: fontI,
            color: DARK,
          });
          curY -= 13;
        }
        curY -= 4;
      }

      if (cert.nextVisit) {
        // Blue next visit badge
        const nextText = sanitize(`Prochain passage recommand\u00e9 : ${fmtDate(cert.nextVisit)}`);
        const nextW = fontB.widthOfTextAtSize(nextText, 8.5) + 24;
        page.drawRectangle({
          x: MARGIN_L + 14,
          y: curY - 5,
          width: nextW,
          height: 22,
          color: BLUE_BG,
        });
        page.drawRectangle({
          x: MARGIN_L + 14,
          y: curY - 5,
          width: nextW,
          height: 22,
          borderColor: BLUE_BORDER,
          borderWidth: 1,
          opacity: 0,
        });
        page.drawText(nextText, {
          x: MARGIN_L + 26,
          y: curY + 2,
          size: 8.5,
          font: fontB,
          color: NAVY,
        });
        curY -= 30;
      }

      curY -= 4;
    }

    // ═══════ 10. SIGNATURES ═══════
    curY -= 4;
    curY = drawSectionHeader(page, "Signatures", curY, fontB, CONTENT_W, MARGIN_L + CONTENT_W / 2);

    const sigBoxW = (CONTENT_W - 40) / 2;
    const sigBoxH = 65;
    const sigLeftX = MARGIN_L;
    const sigRightX = MARGIN_L + sigBoxW + 40;

    // Ensure we don't go off page
    if (curY - sigBoxH - 40 < 44) {
      curY = sigBoxH + 84;
    }

    // Pro signature
    page.drawText("LE PROFESSIONNEL", {
      x: sigLeftX + sigBoxW / 2 - fontB.widthOfTextAtSize("LE PROFESSIONNEL", 7.5) / 2,
      y: curY,
      size: 7.5,
      font: fontB,
      color: DARK,
    });
    page.drawText(sanitize("Lu et approuve"), {
      x: sigLeftX + sigBoxW / 2 - fontI.widthOfTextAtSize(sanitize("Lu et approuve"), 6.5) / 2,
      y: curY - 12,
      size: 6.5,
      font: fontI,
      color: GRAY,
    });

    // Dashed border box for pro signature
    const proBoxY = curY - 22 - sigBoxH;
    page.drawRectangle({
      x: sigLeftX,
      y: proBoxY,
      width: sigBoxW,
      height: sigBoxH,
      color: BG,
      borderColor: LIGHT_GRAY,
      borderWidth: 1.5,
    });
    if (proSigImg) {
      const dims = proSigImg.scale(1);
      const scale = Math.min((sigBoxW - 20) / dims.width, (sigBoxH - 16) / dims.height, 1);
      const sw = dims.width * scale;
      const sh = dims.height * scale;
      page.drawImage(proSigImg, {
        x: sigLeftX + (sigBoxW - sw) / 2,
        y: proBoxY + (sigBoxH - sh) / 2,
        width: sw,
        height: sh,
      });
    }
    // Name under box
    const proNameText = sanitize(companyName);
    page.drawText(proNameText, {
      x: sigLeftX + sigBoxW / 2 - fontR.widthOfTextAtSize(proNameText, 8) / 2,
      y: proBoxY - 12,
      size: 8,
      font: fontR,
      color: GRAY,
    });
    const proDateText = sanitize(`Date : ${fmtDate(cert.date)}`);
    page.drawText(proDateText, {
      x: sigLeftX + sigBoxW / 2 - fontR.widthOfTextAtSize(proDateText, 7) / 2,
      y: proBoxY - 22,
      size: 7,
      font: fontR,
      color: GRAY,
    });

    // Client signature
    page.drawText("LE CLIENT", {
      x: sigRightX + sigBoxW / 2 - fontB.widthOfTextAtSize("LE CLIENT", 7.5) / 2,
      y: curY,
      size: 7.5,
      font: fontB,
      color: DARK,
    });
    page.drawText(sanitize("Lu et approuve"), {
      x: sigRightX + sigBoxW / 2 - fontI.widthOfTextAtSize(sanitize("Lu et approuve"), 6.5) / 2,
      y: curY - 12,
      size: 6.5,
      font: fontI,
      color: GRAY,
    });

    const clientBoxY = curY - 22 - sigBoxH;
    page.drawRectangle({
      x: sigRightX,
      y: clientBoxY,
      width: sigBoxW,
      height: sigBoxH,
      color: BG,
      borderColor: LIGHT_GRAY,
      borderWidth: 1.5,
    });
    if (clientSigImg) {
      const dims = clientSigImg.scale(1);
      const scale = Math.min((sigBoxW - 20) / dims.width, (sigBoxH - 16) / dims.height, 1);
      const sw = dims.width * scale;
      const sh = dims.height * scale;
      page.drawImage(clientSigImg, {
        x: sigRightX + (sigBoxW - sw) / 2,
        y: clientBoxY + (sigBoxH - sh) / 2,
        width: sw,
        height: sh,
      });
    }
    const clientNameText = sanitize(clientName);
    page.drawText(clientNameText, {
      x: sigRightX + sigBoxW / 2 - fontR.widthOfTextAtSize(clientNameText, 8) / 2,
      y: clientBoxY - 12,
      size: 8,
      font: fontR,
      color: GRAY,
    });
    const clientDateText = sanitize(`Date : ${fmtDate(cert.date)}`);
    page.drawText(clientDateText, {
      x: sigRightX + sigBoxW / 2 - fontR.widthOfTextAtSize(clientDateText, 7) / 2,
      y: clientBoxY - 22,
      size: 7,
      font: fontR,
      color: GRAY,
    });

    // ═══════ 11. LEGAL FOOTER ═══════
    const footerY = 36;
    page.drawLine({
      start: { x: MARGIN_L, y: footerY + 14 },
      end: { x: PAGE_W - MARGIN_R, y: footerY + 14 },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });

    const footerLine1 = "\u00c9tabli conform\u00e9ment au d\u00e9cret n\u00b02023-641 du 20 juillet 2023 relatif \u00e0 l'entretien des foyers, appareils et conduits de fum\u00e9e";
    const footerLine1W = fontR.widthOfTextAtSize(footerLine1, 7);
    page.drawText(footerLine1, {
      x: PAGE_W / 2 - footerLine1W / 2,
      y: footerY,
      size: 7,
      font: fontR,
      color: GRAY,
    });

    const footerLine2 = sanitize(`Ce document doit \u00eatre conserv\u00e9 pendant une dur\u00e9e minimale de 2 ans \u2013 Validit\u00e9 : ${t(cert.periodicity).toLowerCase()}`);
    const footerLine2W = fontR.widthOfTextAtSize(footerLine2, 7);
    page.drawText(footerLine2, {
      x: PAGE_W / 2 - footerLine2W / 2,
      y: footerY - 12,
      size: 7,
      font: fontR,
      color: GRAY,
    });

    const footerBrand = "Bistry \u2013 Logiciel de gestion pour ramoneurs";
    const footerBrandW = fontR.widthOfTextAtSize(footerBrand, 6.5);
    page.drawText(footerBrand, {
      x: PAGE_W / 2 - footerBrandW / 2,
      y: footerY - 26,
      size: 6.5,
      font: fontR,
      color: LIGHT_GRAY,
    });

    // Serialize
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Certificat-Ramonage-${sanitize(safe(cert.client.lastName, ""))}-${sanitize(safe(cert.client.firstName, ""))}-${fmtDate(cert.date).replace(/\//g, "-")}.pdf"`,
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
