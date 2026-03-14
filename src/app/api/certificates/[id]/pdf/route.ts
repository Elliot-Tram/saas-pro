import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

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
  if (!key) return "\u2014";
  return labels[key] || key;
}

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

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Build the full HTML certificate ──────────────────────────────────────────
function buildCertificateHtml(cert: {
  number: string | null;
  date: Date | null;
  clientQuality: string | null;
  chimneyType: string | null;
  chimneyLocation: string | null;
  fuelType: string | null;
  applianceBrand: string | null;
  applianceModel: string | null;
  method: string | null;
  conduitType: string | null;
  conduitDiameter: string | null;
  conduitLength: string | null;
  condition: string | null;
  vacuumTest: boolean;
  anomalies: unknown;
  observations: string | null;
  recommendations: string | null;
  periodicity: string | null;
  nextVisit: Date | null;
  proSignature: string | null;
  clientSignature: string | null;
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
    qualification: string | null;
  };
}): string {
  const clientName =
    `${safe(cert.client.firstName, "")} ${safe(cert.client.lastName, "")}`.trim() || "\u2014";
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
    cert.team.phone ? `Tél. ${cert.team.phone}` : null,
  ].filter(Boolean) as string[];

  const proParts = [
    cert.team.siret ? `SIRET : ${cert.team.siret}` : null,
    cert.team.insurerName
      ? `Assurance RC : ${cert.team.insurerName}${cert.team.insuranceNumber ? ` \u2014 Police n\u00b0${cert.team.insuranceNumber}` : ""}`
      : null,
    cert.team.qualification
      ? `Qualification : ${cert.team.qualification}`
      : null,
  ].filter(Boolean) as string[];

  const anomalies = (cert.anomalies as string[] | null) || [];

  const vacLabel = cert.vacuumTest ? "CONFORME" : "NON CONFORME";
  const vacClass = cert.vacuumTest ? "badge-green" : "badge-red";

  const condLabel = t(cert.condition).toUpperCase();
  const condClass =
    cert.condition === "bon_etat"
      ? "badge-green"
      : cert.condition === "a_surveiller"
        ? "badge-orange"
        : "badge-red";

  const brandModel = [cert.applianceBrand, cert.applianceModel]
    .filter(Boolean)
    .join(" \u2014 ");

  const logoHtml = cert.team.logo
    ? `<img src="${cert.team.logo}" class="logo" alt="Logo" />`
    : "";

  const proSignatureHtml = cert.proSignature
    ? `<img src="${cert.proSignature}" class="sig-img" alt="Signature professionnel" />`
    : "";

  const clientSignatureHtml = cert.clientSignature
    ? `<img src="${cert.clientSignature}" class="sig-img" alt="Signature client" />`
    : "";

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
    color: #111827;
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
    height: 8px;
    background: linear-gradient(90deg, #0f2b46, #1e40af);
    width: 100%;
  }

  /* ── Content area ─────────────────────────────────── */
  .content {
    padding: 32px 44px 20px 44px;
  }

  /* ── Header ───────────────────────────────────────── */
  .header {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
    align-items: start;
    margin-bottom: 24px;
  }

  .header-left {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .logo {
    max-height: 60px;
    max-width: 90px;
    object-fit: contain;
    border-radius: 1px;
  }

  .company-info {
    padding-top: 2px;
  }

  .company-name {
    font-size: 18px;
    font-weight: 800;
    color: #0f2b46;
    margin-bottom: 4px;
    letter-spacing: -0.03em;
  }

  .company-detail {
    font-size: 9px;
    color: #6b7280;
    line-height: 1.6;
  }

  .title-block {
    text-align: right;
    padding-top: 0;
  }

  .title-main {
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 26px;
    font-weight: 700;
    color: #0f2b46;
    letter-spacing: -0.01em;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .title-accent {
    display: inline-block;
    width: 40px;
    height: 2px;
    background: #2563eb;
    margin-bottom: 10px;
  }

  .cert-number {
    font-size: 11px;
    color: #6b7280;
    font-weight: 400;
  }

  .cert-date {
    font-size: 10px;
    color: #9ca3af;
    margin-top: 2px;
    font-weight: 400;
  }

  /* ── Pro info bar ─────────────────────────────────── */
  .pro-bar {
    padding: 8px 0;
    text-align: center;
    font-size: 8px;
    color: #6b7280;
    margin-bottom: 24px;
    letter-spacing: 0.02em;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }

  .pro-bar span {
    margin: 0 10px;
    color: #d1d5db;
  }

  /* ── Section ──────────────────────────────────────── */
  .section {
    margin-bottom: 24px;
  }

  .section-header {
    margin-top: 20px;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #0f2b46;
  }

  /* ── Card styles ──────────────────────────────────── */
  .card {
    padding: 14px 18px 14px 20px;
  }

  .card-filled {
    background: #fafbfc;
    border-left: 3px solid #e5e7eb;
  }

  .card-bordered {
    border-left: 3px solid #e5e7eb;
    background: #fff;
  }

  /* ── Grid layouts ─────────────────────────────────── */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 36px;
  }

  /* ── Field (label + value) ────────────────────────── */
  .field {
    margin-bottom: 7px;
  }

  .field-label {
    font-size: 9px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    margin-bottom: 1px;
  }

  .field-value {
    font-size: 13px;
    color: #111827;
    font-weight: 500;
  }

  .field-value-bold {
    font-size: 13px;
    color: #111827;
    font-weight: 700;
  }

  /* ── Badges ───────────────────────────────────────── */
  .badge {
    display: inline-block;
    padding: 8px 24px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .badge-green {
    background: #ecfdf5;
    color: #059669;
    border: 2px solid #a7f3d0;
    box-shadow: inset 0 1px 2px rgba(5, 150, 105, 0.08);
  }

  .badge-red {
    background: #fef2f2;
    color: #dc2626;
    border: 2px solid #fecaca;
    box-shadow: inset 0 1px 2px rgba(220, 38, 38, 0.08);
  }

  .badge-orange {
    background: #fffbeb;
    color: #d97706;
    border: 2px solid #fde68a;
    box-shadow: inset 0 1px 2px rgba(217, 119, 6, 0.08);
  }

  /* ── Result row ───────────────────────────────────── */
  .result-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
  }

  .result-row + .result-row {
    border-top: 1px solid #e5e7eb;
  }

  .result-label {
    font-size: 10px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-weight: 600;
  }

  /* ── Method + Periodicity line ─────────────────────── */
  .method-line {
    display: flex;
    gap: 48px;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  /* ── Anomalies ────────────────────────────────────── */
  .anomaly-ok {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
  }

  .anomaly-ok-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #ecfdf5;
    border: 2px solid #a7f3d0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .anomaly-ok-icon svg {
    width: 18px;
    height: 18px;
  }

  .anomaly-ok-text {
    font-size: 14px;
    font-weight: 700;
    color: #059669;
  }

  .anomaly-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 6px 0;
  }

  .anomaly-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #dc2626;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0;
  }

  .anomaly-icon svg {
    width: 12px;
    height: 12px;
  }

  .anomaly-text {
    font-size: 12px;
    color: #dc2626;
    font-weight: 600;
    line-height: 1.6;
    padding-top: 3px;
  }

  /* ── Observations ─────────────────────────────────── */
  .obs-text {
    font-size: 12px;
    color: #374151;
    line-height: 1.6;
    margin-bottom: 10px;
  }

  .obs-rec-label {
    font-size: 9px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
    margin-top: 10px;
  }

  .obs-rec-text {
    font-size: 12px;
    color: #374151;
    font-style: italic;
    line-height: 1.6;
  }

  .next-visit {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 16px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: #0f2b46;
  }

  .next-visit-icon {
    font-size: 13px;
  }

  /* ── Signatures ───────────────────────────────────── */
  .signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 10px;
  }

  .sig-block {
    text-align: center;
  }

  .sig-label {
    font-size: 10px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 4px;
  }

  .sig-approve {
    font-size: 8px;
    color: #9ca3af;
    font-style: italic;
    margin-bottom: 8px;
  }

  .sig-box {
    border: 2px dashed #d1d5db;
    border-radius: 4px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    background: #fafbfc;
  }

  .sig-img {
    max-width: 200px;
    max-height: 80px;
    object-fit: contain;
  }

  .sig-name {
    font-size: 9px;
    color: #6b7280;
    font-weight: 500;
  }

  .sig-date {
    font-size: 8px;
    color: #9ca3af;
    margin-top: 2px;
  }

  /* ── Footer ───────────────────────────────────────── */
  .footer {
    text-align: center;
    padding: 0 44px;
  }

  .footer-line {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 20px 0 12px 0;
  }

  .footer-text {
    font-size: 8.5px;
    color: #9ca3af;
    line-height: 1.7;
  }

  .footer-brand {
    font-size: 7.5px;
    color: #d1d5db;
    margin-top: 6px;
    letter-spacing: 0.04em;
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
      <div class="header-left">
        ${logoHtml}
        <div class="company-info">
          <div class="company-name">${escHtml(companyName)}</div>
          ${companyLines.map((l) => `<div class="company-detail">${escHtml(l)}</div>`).join("\n          ")}
        </div>
      </div>
      <div class="title-block">
        <div class="title-main">CERTIFICAT DE RAMONAGE</div>
        <div><span class="title-accent"></span></div>
        <div class="cert-number">N\u00b0 ${escHtml(safe(cert.number))}</div>
        <div class="cert-date">Date : ${fmtDate(cert.date)}</div>
      </div>
    </div>

    <!-- ═══════ PRO INFO BAR ═══════ -->
    ${
      proParts.length > 0
        ? `<div class="pro-bar">${proParts.map((p) => escHtml(p)).join('<span>|</span>')}</div>`
        : ""
    }

    <!-- ═══════ CLIENT ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Client</div>
      </div>
      <div class="card card-filled">
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-value-bold">${escHtml(clientName)}</div>
            </div>
            <div class="field">
              <div class="field-label">Qualit\u00e9</div>
              <div class="field-value">${escHtml(t(cert.clientQuality))}</div>
            </div>
            <div class="field">
              <div class="field-label">Adresse</div>
              <div class="field-value">${escHtml(safe(clientAddr))}</div>
            </div>
          </div>
          <div>
            ${
              cert.client.phone
                ? `<div class="field">
              <div class="field-label">T\u00e9l\u00e9phone</div>
              <div class="field-value">${escHtml(cert.client.phone)}</div>
            </div>`
                : ""
            }
            ${
              cert.client.email
                ? `<div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${escHtml(cert.client.email)}</div>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ INSTALLATION ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Installation</div>
      </div>
      <div class="card card-bordered">
        <div class="grid-2">
          <div>
            <div class="field">
              <div class="field-label">Type d'appareil</div>
              <div class="field-value-bold">${escHtml(safe(cert.chimneyType))}</div>
            </div>
            <div class="field">
              <div class="field-label">Marque / Mod\u00e8le</div>
              <div class="field-value">${escHtml(safe(brandModel))}</div>
            </div>
            <div class="field">
              <div class="field-label">Combustible</div>
              <div class="field-value">${escHtml(safe(cert.fuelType))}</div>
            </div>
          </div>
          <div>
            <div class="field">
              <div class="field-label">Type de conduit</div>
              <div class="field-value">${escHtml(safe(cert.conduitType))}</div>
            </div>
            <div class="field">
              <div class="field-label">Diam\u00e8tre / Longueur</div>
              <div class="field-value">${escHtml(cert.conduitDiameter ? `\u00d8 ${cert.conduitDiameter}` : "\u2014")}${cert.conduitLength ? ` \u2014 Long. ${escHtml(cert.conduitLength)}` : ""}</div>
            </div>
            <div class="field">
              <div class="field-label">Localisation</div>
              <div class="field-value">${escHtml(safe(cert.chimneyLocation))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════ RESULTAT DE L'INTERVENTION ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">R\u00e9sultat de l\u2019intervention</div>
      </div>
      <div class="card card-filled">
        <div class="method-line">
          <div class="field" style="margin-bottom:0">
            <div class="field-label">M\u00e9thode</div>
            <div class="field-value-bold">${escHtml(t(cert.method))}</div>
          </div>
          <div class="field" style="margin-bottom:0">
            <div class="field-label">P\u00e9riodicit\u00e9</div>
            <div class="field-value-bold">${escHtml(t(cert.periodicity))}</div>
          </div>
        </div>
        <div class="result-row">
          <div class="result-label">Vacuit\u00e9 du conduit</div>
          <span class="badge ${vacClass}">${vacLabel}</span>
        </div>
        <div class="result-row">
          <div class="result-label">\u00c9tat g\u00e9n\u00e9ral</div>
          <span class="badge ${condClass}">${escHtml(condLabel)}</span>
        </div>
      </div>
    </div>

    <!-- ═══════ ANOMALIES ═══════ -->
    <div class="section">
      <div class="section-header">
        <div class="section-title">Anomalies constat\u00e9es</div>
      </div>
      <div class="card card-bordered">
        ${
          anomalies.length === 0
            ? `<div class="anomaly-ok">
          <div class="anomaly-ok-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div class="anomaly-ok-text">Aucune anomalie constat\u00e9e</div>
        </div>`
            : anomalies
                .map(
                  (a) => `<div class="anomaly-item">
          <div class="anomaly-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <div class="anomaly-text">${escHtml(t(a))}</div>
        </div>`
                )
                .join("\n        ")
        }
      </div>
    </div>

    <!-- ═══════ OBSERVATIONS & RECOMMANDATIONS ═══════ -->
    ${
      cert.observations || cert.recommendations || cert.nextVisit
        ? `<div class="section">
      <div class="section-header">
        <div class="section-title">Observations &amp; Recommandations</div>
      </div>
      <div class="card card-filled">
        ${cert.observations ? `<div class="obs-text">${escHtml(cert.observations)}</div>` : ""}
        ${
          cert.recommendations
            ? `<div class="obs-rec-label">Recommandations</div>
        <div class="obs-rec-text">${escHtml(cert.recommendations)}</div>`
            : ""
        }
        ${
          cert.nextVisit
            ? `<div class="next-visit">
          <span class="next-visit-icon">\ud83d\udcc5</span>
          Prochain passage recommand\u00e9 : ${fmtDate(cert.nextVisit)}
        </div>`
            : ""
        }
      </div>
    </div>`
        : ""
    }

    <!-- ═══════ SIGNATURES ═══════ -->
    <div class="signatures">
      <div class="sig-block">
        <div class="sig-label">Le professionnel</div>
        <div class="sig-approve">Lu et approuv\u00e9</div>
        <div class="sig-box">
          ${proSignatureHtml}
        </div>
        <div class="sig-name">${escHtml(companyName)}</div>
        <div class="sig-date">Date : ${fmtDate(cert.date)}</div>
      </div>
      <div class="sig-block">
        <div class="sig-label">Le client</div>
        <div class="sig-approve">Lu et approuv\u00e9</div>
        <div class="sig-box">
          ${clientSignatureHtml}
        </div>
        <div class="sig-name">${escHtml(clientName)}</div>
        <div class="sig-date">Date : ${fmtDate(cert.date)}</div>
      </div>
    </div>

    <!-- ═══════ FOOTER ═══════ -->
    <hr class="footer-line" />

    <div class="footer">
      <div class="footer-text">
        \u00c9tabli conform\u00e9ment au d\u00e9cret n\u00b02023-641 du 20 juillet 2023 relatif \u00e0 l\u2019entretien des foyers, appareils et conduits de fum\u00e9e
      </div>
      <div class="footer-text">
        Ce document doit \u00eatre conserv\u00e9 pendant une dur\u00e9e minimale de 2 ans \u2014 Validit\u00e9 : ${escHtml(t(cert.periodicity).toLowerCase())}
      </div>
      <div class="footer-brand">Bistry \u2014 Logiciel de gestion pour ramoneurs</div>
    </div>
  </div>
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTE CONFIG — increase memory for Chromium
// ═══════════════════════════════════════════════════════════════════════════════
export const maxDuration = 30;
export const dynamic = "force-dynamic";

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
    where: { id, teamId: session.teamId },
    include: { client: true, team: true },
  });
  if (!cert)
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Build the HTML certificate
  const html = buildCertificateHtml(cert as Parameters<typeof buildCertificateHtml>[0]);

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
        args: [...chromium.args, "--disable-gpu", "--single-process"],
        defaultViewport: { width: 800, height: 600 },
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
        "Content-Disposition": `inline; filename="certificat-${cert.number}.pdf"`,
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
      { error: "Erreur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}
