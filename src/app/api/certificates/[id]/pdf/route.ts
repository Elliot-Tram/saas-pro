import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

const BLUE = rgb(0.22, 0.4, 0.87);
const DARK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.45, 0.45, 0.45);
const LIGHT_BG = rgb(0.96, 0.96, 0.96);
const GREEN = rgb(0.13, 0.55, 0.13);
const RED = rgb(0.8, 0.15, 0.15);
const ORANGE = rgb(0.85, 0.55, 0.1);
const WHITE = rgb(1, 1, 1);

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
  anomaly_distance_plancher: "Distance de sécurité aux traversées de plancher non conforme",
  anomaly_distance_toiture: "Distance de sécurité au niveau de la toiture non conforme",
  anomaly_etancheite: "Défaut d'étanchéité du conduit",
  anomaly_coudes: "Coudes non conformes (>2 coudes à 90° par DTU 24.1)",
  anomaly_souche: "Souche de cheminée défectueuse",
  anomaly_section_horizontale: "Section horizontale excessive (>3m)",
  anomaly_plaque: "Absence de plaque signalétique",
  anomaly_bistre: "Présence de bistre importante",
  anomaly_autre: "Autre anomalie",
};

function t(key: string) {
  return labels[key] || key;
}

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

function drawSectionTitle(page: PDFPage, title: string, y: number, font: PDFFont, width: number) {
  page.drawRectangle({ x: 40, y: y - 4, width: width - 80, height: 20, color: BLUE });
  page.drawText(title, { x: 50, y: y, size: 9, font, color: WHITE });
  return y - 28;
}

function drawField(page: PDFPage, label: string, value: string, x: number, y: number, fontR: PDFFont, fontB: PDFFont) {
  page.drawText(label + " :", { x, y, size: 8, font: fontR, color: GRAY });
  page.drawText(value, { x: x + 2, y: y - 12, size: 9, font: fontB, color: DARK });
  return y - 28;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const cert = await prisma.certificate.findFirst({
    where: { id, userId: session.userId },
    include: { client: true, user: true },
  });
  if (!cert) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const fontR = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontB = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 40;

  // ── LOGO ──
  let logoEndX = 40;
  if (cert.user.logo) {
    try {
      const base64Data = cert.user.logo.split(",")[1];
      const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const isPng = cert.user.logo.includes("image/png");
      const img = isPng
        ? await pdfDoc.embedPng(imageBytes)
        : await pdfDoc.embedJpg(imageBytes);
      const scale = 60 / img.height;
      const w = img.width * scale;
      page.drawImage(img, { x: 40, y: y - 50, width: w, height: 60 });
      logoEndX = 40 + w + 15;
    } catch {
      // Skip logo if invalid
    }
  }

  // ── COMPANY INFO ──
  const companyX = logoEndX;
  page.drawText(cert.user.company || cert.user.name, { x: companyX, y, size: 14, font: fontB, color: BLUE });
  let infoY = y - 14;
  const infoLines = [
    cert.user.address,
    [cert.user.postalCode, cert.user.city].filter(Boolean).join(" "),
    [cert.user.phone, cert.user.email].filter(Boolean).join(" — "),
    cert.user.siret ? `SIRET: ${cert.user.siret}` : null,
    cert.user.insurerName ? `Assurance RC: ${cert.user.insurerName}${cert.user.insuranceNumber ? ` — Police n°${cert.user.insuranceNumber}` : ""}` : null,
    cert.user.qualification ? `Qualification: ${cert.user.qualification}` : null,
  ].filter(Boolean) as string[];

  for (const line of infoLines) {
    page.drawText(line, { x: companyX, y: infoY, size: 7.5, font: fontR, color: GRAY });
    infoY -= 11;
  }

  // ── TITLE ──
  const title = "CERTIFICAT DE RAMONAGE";
  const titleW = fontB.widthOfTextAtSize(title, 18);
  page.drawText(title, { x: width - 40 - titleW, y: height - 40, size: 18, font: fontB, color: DARK });
  page.drawText(`N° ${cert.number}`, { x: width - 40 - fontR.widthOfTextAtSize(`N° ${cert.number}`, 9), y: height - 56, size: 9, font: fontR, color: GRAY });
  page.drawText(`Date : ${fmtDate(cert.date)}`, { x: width - 40 - fontR.widthOfTextAtSize(`Date : ${fmtDate(cert.date)}`, 9), y: height - 69, size: 9, font: fontR, color: GRAY });

  // ── SEPARATOR ──
  y = height - 130;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });

  // ── CLIENT SECTION ──
  y -= 8;
  y = drawSectionTitle(page, "CLIENT", y, fontB, width);
  const col1 = 50;
  const col2 = 300;
  y = drawField(page, "Nom", `${cert.client.firstName} ${cert.client.lastName}`, col1, y, fontR, fontB);
  drawField(page, "Qualité", t(cert.clientQuality), col2, y + 28, fontR, fontB);
  y = drawField(page, "Adresse", `${cert.client.address}${cert.client.postalCode ? `, ${cert.client.postalCode}` : ""}${cert.client.city ? ` ${cert.client.city}` : ""}`, col1, y, fontR, fontB);
  if (cert.client.phone) drawField(page, "Téléphone", cert.client.phone, col2, y + 28, fontR, fontB);

  // ── INSTALLATION SECTION ──
  y -= 5;
  y = drawSectionTitle(page, "INSTALLATION", y, fontB, width);
  y = drawField(page, "Type d'appareil", cert.chimneyType, col1, y, fontR, fontB);
  drawField(page, "Combustible", cert.fuelType || "—", col2, y + 28, fontR, fontB);
  if (cert.applianceBrand || cert.applianceModel) {
    y = drawField(page, "Marque / Modèle", [cert.applianceBrand, cert.applianceModel].filter(Boolean).join(" — "), col1, y, fontR, fontB);
  }
  if (cert.chimneyLocation) {
    y = drawField(page, "Localisation", cert.chimneyLocation, col1, y, fontR, fontB);
    if (cert.conduitType) drawField(page, "Type de conduit", cert.conduitType, col2, y + 28, fontR, fontB);
  } else if (cert.conduitType) {
    y = drawField(page, "Type de conduit", cert.conduitType, col1, y, fontR, fontB);
  }
  if (cert.conduitDiameter || cert.conduitLength) {
    y = drawField(page, "Dimensions", [cert.conduitDiameter ? `Ø ${cert.conduitDiameter}` : null, cert.conduitLength ? `L ${cert.conduitLength}` : null].filter(Boolean).join(" — "), col1, y, fontR, fontB);
  }

  // ── INTERVENTION SECTION ──
  y -= 5;
  y = drawSectionTitle(page, "INTERVENTION & ÉVALUATION", y, fontB, width);
  y = drawField(page, "Méthode", t(cert.method), col1, y, fontR, fontB);
  drawField(page, "Périodicité", t(cert.periodicity), col2, y + 28, fontR, fontB);

  // Vacuum test
  page.drawText("Vacuité du conduit :", { x: col1, y, size: 8, font: fontR, color: GRAY });
  const vacLabel = cert.vacuumTest ? "CONFORME" : "NON CONFORME";
  const vacColor = cert.vacuumTest ? GREEN : RED;
  page.drawText(vacLabel, { x: col1 + 2, y: y - 12, size: 10, font: fontB, color: vacColor });

  // Condition
  page.drawText("État général :", { x: col2, y, size: 8, font: fontR, color: GRAY });
  const condColor = cert.condition === "bon_etat" ? GREEN : cert.condition === "a_surveiller" ? ORANGE : RED;
  page.drawText(t(cert.condition).toUpperCase(), { x: col2 + 2, y: y - 12, size: 10, font: fontB, color: condColor });
  y -= 30;

  // ── ANOMALIES SECTION ──
  y -= 5;
  y = drawSectionTitle(page, "ANOMALIES CONSTATÉES", y, fontB, width);
  const anomalies = (cert.anomalies as string[] | null) || [];
  if (anomalies.length === 0) {
    page.drawText("Aucune anomalie constatée", { x: col1, y, size: 9, font: fontB, color: GREEN });
    y -= 16;
  } else {
    for (const a of anomalies) {
      page.drawText("•  " + t(a), { x: col1, y, size: 8, font: fontR, color: RED });
      y -= 14;
    }
  }

  // ── OBSERVATIONS ──
  if (cert.observations || cert.recommendations) {
    y -= 5;
    y = drawSectionTitle(page, "OBSERVATIONS & RECOMMANDATIONS", y, fontB, width);
    if (cert.observations) {
      const lines = wrapText(cert.observations, fontR, 8, width - 100);
      for (const line of lines) {
        page.drawText(line, { x: col1, y, size: 8, font: fontR, color: DARK });
        y -= 12;
      }
      y -= 4;
    }
    if (cert.recommendations) {
      page.drawText("Recommandations :", { x: col1, y, size: 8, font: fontB, color: GRAY });
      y -= 12;
      const lines = wrapText(cert.recommendations, fontR, 8, width - 100);
      for (const line of lines) {
        page.drawText(line, { x: col1, y, size: 8, font: fontR, color: DARK });
        y -= 12;
      }
    }
  }

  if (cert.nextVisit) {
    y -= 4;
    page.drawText(`Prochain passage recommandé : ${fmtDate(cert.nextVisit)}`, { x: col1, y, size: 9, font: fontB, color: BLUE });
    y -= 16;
  }

  // ── SIGNATURES ──
  const sigY = Math.min(y - 20, 160);
  page.drawLine({ start: { x: 40, y: sigY + 80 }, end: { x: width - 40, y: sigY + 80 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });

  // Pro signature
  page.drawText("Le professionnel", { x: 50, y: sigY + 60, size: 9, font: fontB, color: DARK });
  page.drawRectangle({ x: 50, y: sigY - 5, width: 200, height: 55, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5, color: LIGHT_BG });
  if (cert.proSignature) {
    try {
      const base64Data = cert.proSignature.split(",")[1];
      const sigBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const sigImg = await pdfDoc.embedPng(sigBytes);
      const scale = Math.min(190 / sigImg.width, 45 / sigImg.height);
      page.drawImage(sigImg, { x: 55, y: sigY, width: sigImg.width * scale, height: sigImg.height * scale });
    } catch { /* skip */ }
  }
  page.drawText(`Date : ${fmtDate(cert.date)}`, { x: 50, y: sigY - 16, size: 7, font: fontR, color: GRAY });

  // Client signature
  page.drawText("Le client", { x: 330, y: sigY + 60, size: 9, font: fontB, color: DARK });
  page.drawRectangle({ x: 330, y: sigY - 5, width: 200, height: 55, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5, color: LIGHT_BG });
  if (cert.clientSignature) {
    try {
      const base64Data = cert.clientSignature.split(",")[1];
      const sigBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const sigImg = await pdfDoc.embedPng(sigBytes);
      const scale = Math.min(190 / sigImg.width, 45 / sigImg.height);
      page.drawImage(sigImg, { x: 335, y: sigY, width: sigImg.width * scale, height: sigImg.height * scale });
    } catch { /* skip */ }
  }
  page.drawText(`Date : ${fmtDate(cert.date)}`, { x: 330, y: sigY - 16, size: 7, font: fontR, color: GRAY });

  // ── LEGAL FOOTER ──
  const footerY = 25;
  const legal1 = "Établi conformément au décret n°2023-641 du 20 juillet 2023";
  const legal2 = "Ce document doit être conservé pendant une durée minimale de 2 ans";
  const legal3 = `Validité : ${t(cert.periodicity)}`;
  page.drawText(legal1, { x: (width - fontR.widthOfTextAtSize(legal1, 7)) / 2, y: footerY + 16, size: 7, font: fontR, color: GRAY });
  page.drawText(legal2, { x: (width - fontR.widthOfTextAtSize(legal2, 7)) / 2, y: footerY + 7, size: 7, font: fontR, color: GRAY });
  page.drawText(legal3, { x: (width - fontB.widthOfTextAtSize(legal3, 7)) / 2, y: footerY - 2, size: 7, font: fontB, color: BLUE });

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificat-${cert.number}.pdf"`,
    },
  });
}
