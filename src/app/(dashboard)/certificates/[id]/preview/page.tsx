import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PrintButton } from "@/components/ui/PrintButton";

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

function t(key: string | null | undefined) {
  if (!key) return "—";
  return labels[key] || key;
}

function fmtDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export default async function CertificatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const cert = await prisma.certificate.findFirst({
    where: { id, teamId: session.teamId },
    include: { client: true, team: true },
  });

  if (!cert) notFound();

  const companyName = cert.team.company || cert.team.name;
  const clientName = `${cert.client.firstName} ${cert.client.lastName}`;
  const clientAddr = [cert.client.address, [cert.client.postalCode, cert.client.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const brandModel = [cert.applianceBrand, cert.applianceModel].filter(Boolean).join(" – ");
  const anomalies = (cert.anomalies as string[] | null) || [];

  const condClass = cert.condition === "bon_etat" ? "badge-green" : cert.condition === "a_surveiller" ? "badge-amber" : "badge-red";
  const vacClass = cert.vacuumTest ? "badge-green" : "badge-red";

  const proParts = [
    cert.team.siret ? `SIRET : ${cert.team.siret}` : null,
    cert.team.insurerName ? `Assurance RC : ${cert.team.insurerName}${cert.team.insuranceNumber ? ` – Police n°${cert.team.insuranceNumber}` : ""}` : null,
    cert.team.qualification ? `Qualification : ${cert.team.qualification}` : null,
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .certificate { box-shadow: none !important; margin: 0 !important; }
        }

        @page {
          margin: 0;
          size: A4;
        }

        .certificate {
          width: 210mm;
          height: 297mm;
          margin: 0 auto;
          background: #fff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #111827;
          font-size: 10px;
          line-height: 1.35;
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
          padding: 16px 32px 8px;
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

        .title-block { text-align: right; }

        .title-main {
          font-size: 15px;
          font-weight: 700;
          color: #0f2b46;
          line-height: 1.15;
          text-transform: uppercase;
        }

        .title-accent {
          width: 28px;
          height: 2px;
          background: #2563eb;
          margin-left: auto;
          margin-top: 3px;
          margin-bottom: 4px;
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
        .section { margin-bottom: 6px; }
        .section-title {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0f2b46;
          padding-bottom: 3px;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 5px;
        }

        /* Cards */
        .card {
          border-left: 2px solid #e5e7eb;
          padding: 5px 10px;
          margin-bottom: 1px;
        }
        .card-filled {
          background: #f9fafb;
          border-left-color: #d1d5db;
        }

        /* Grid */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1px 20px; }

        /* Fields */
        .field { margin-bottom: 3px; }
        .field-label {
          font-size: 6.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 0;
        }
        .field-value {
          font-size: 10px;
          color: #111827;
          font-weight: 500;
        }
        .field-value-bold {
          font-size: 10px;
          color: #111827;
          font-weight: 700;
        }

        /* Badges */
        .badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .badge-green {
          background: #ecfdf5;
          color: #059669;
          border: 2px solid #a7f3d0;
        }
        .badge-red {
          background: #fef2f2;
          color: #dc2626;
          border: 2px solid #fecaca;
        }
        .badge-amber {
          background: #fffbeb;
          color: #d97706;
          border: 2px solid #fde68a;
        }

        /* Result rows */
        .result-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 10px;
        }
        .result-row + .result-row { border-top: 1px solid #f3f4f6; }
        .result-label {
          font-size: 8px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #6b7280;
        }

        /* Method line */
        .method-line {
          display: flex;
          gap: 24px;
          padding: 4px 10px 6px;
          border-bottom: 1px solid #f3f4f6;
        }

        /* Anomalies */
        .anomaly-ok {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
        }
        .anomaly-ok-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #ecfdf5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .anomaly-ok-text { font-size: 11px; font-weight: 700; color: #059669; }

        .anomaly-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 2px 12px;
        }
        .anomaly-icon {
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #fef2f2;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .anomaly-text { font-size: 10px; font-weight: 600; color: #dc2626; }

        /* Observations */
        .obs-text { font-size: 9px; color: #374151; line-height: 1.4; padding: 0 10px; }
        .obs-rec-label {
          font-size: 6.5px; font-weight: 700; color: #6b7280;
          text-transform: uppercase; letter-spacing: 0.06em;
          margin: 3px 10px 1px;
        }
        .obs-rec-text { font-size: 9px; color: #374151; font-style: italic; line-height: 1.4; padding: 0 10px; }

        .next-visit {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin: 4px 10px 0;
          padding: 3px 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 3px;
          font-size: 8px;
          font-weight: 700;
          color: #1e40af;
        }

        /* Signatures */
        .sig-section {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid #e5e7eb;
        }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .sig-block { text-align: center; }
        .sig-label { font-size: 7px; font-weight: 700; color: #374151; margin-bottom: 1px; }
        .sig-sub { font-size: 6px; font-style: italic; color: #9ca3af; margin-bottom: 3px; }
        .sig-box {
          border: 1px dashed #d1d5db;
          border-radius: 4px;
          height: 40px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2px;
          background: #fafbfc;
        }
        .sig-img { max-width: 120px; max-height: 32px; object-fit: contain; }
        .sig-name { font-size: 7px; color: #6b7280; }
        .sig-date { font-size: 6.5px; color: #9ca3af; }

        /* Footer */
        .footer {
          text-align: center;
          padding: 6px 32px 6px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
          flex-shrink: 0;
        }
        .footer-text { font-size: 6.5px; color: #9ca3af; line-height: 1.6; }
        .footer-brand { font-size: 6px; color: #d1d5db; margin-top: 1px; }

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

      {/* Print bar */}
      <div className="print-bar no-print">
        <a href={`/certificates/${cert.id}`}>← Retour au certificat</a>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>Aperçu du certificat</span>
          <PrintButton />
        </div>
      </div>

      <div className="certificate">
        <div className="accent-bar" />
        <div className="content">

          {/* Header */}
          <div className="header">
            <div>
              {cert.team.logo && <img src={cert.team.logo} className="logo" alt="Logo" />}
            </div>
            <div>
              <div className="company-name">{companyName}</div>
              {cert.team.address && <div className="company-detail">{cert.team.address}</div>}
              {(cert.team.postalCode || cert.team.city) && (
                <div className="company-detail">{[cert.team.postalCode, cert.team.city].filter(Boolean).join(" ")}</div>
              )}
              {cert.team.phone && <div className="company-detail">Tél. {cert.team.phone}</div>}
            </div>
            <div className="title-block">
              <div className="title-main">Certificat de ramonage</div>
              <div className="title-accent" />
              <div className="cert-meta">N° {cert.number}</div>
              <div className="cert-meta">Date : {fmtDate(cert.date)}</div>
            </div>
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

          {/* Client */}
          <div className="section">
            <div className="section-title">Client</div>
            <div className="card card-filled">
              <div className="grid-2">
                <div>
                  <div className="field">
                    <div className="field-value-bold">{clientName}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Qualité</div>
                    <div className="field-value">{t(cert.clientQuality)}</div>
                  </div>
                  <div className="field">
                    <div className="field-label">Adresse</div>
                    <div className="field-value">{clientAddr}</div>
                  </div>
                </div>
                <div>
                  {cert.client.phone && (
                    <div className="field">
                      <div className="field-label">Téléphone</div>
                      <div className="field-value">{cert.client.phone}</div>
                    </div>
                  )}
                  {cert.client.email && (
                    <div className="field">
                      <div className="field-label">Email</div>
                      <div className="field-value">{cert.client.email}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Installation */}
          <div className="section">
            <div className="section-title">Installation</div>
            <div className="card">
              <div className="grid-2">
                <div>
                  <div className="field">
                    <div className="field-label">Type d&apos;appareil</div>
                    <div className="field-value-bold">{cert.chimneyType}</div>
                  </div>
                  {brandModel && (
                    <div className="field">
                      <div className="field-label">Marque / Modèle</div>
                      <div className="field-value">{brandModel}</div>
                    </div>
                  )}
                  <div className="field">
                    <div className="field-label">Combustible</div>
                    <div className="field-value">{cert.fuelType || "—"}</div>
                  </div>
                </div>
                <div>
                  {cert.conduitType && (
                    <div className="field">
                      <div className="field-label">Type de conduit</div>
                      <div className="field-value">{cert.conduitType}</div>
                    </div>
                  )}
                  {(cert.conduitDiameter || cert.conduitLength) && (
                    <div className="field">
                      <div className="field-label">Diamètre / Longueur</div>
                      <div className="field-value">
                        {cert.conduitDiameter && `Ø ${cert.conduitDiameter}`}
                        {cert.conduitDiameter && cert.conduitLength && " – "}
                        {cert.conduitLength && `Long. ${cert.conduitLength}`}
                      </div>
                    </div>
                  )}
                  {cert.chimneyLocation && (
                    <div className="field">
                      <div className="field-label">Localisation</div>
                      <div className="field-value">{cert.chimneyLocation}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="section">
            <div className="section-title">Résultat de l&apos;intervention</div>
            <div className="card card-filled">
              <div className="method-line">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Méthode</div>
                  <div className="field-value-bold">{t(cert.method)}</div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className="field-label">Périodicité</div>
                  <div className="field-value-bold">{t(cert.periodicity)}</div>
                </div>
              </div>
              <div className="result-row">
                <div className="result-label">Vacuité du conduit</div>
                <span className={`badge ${vacClass}`}>{cert.vacuumTest ? "Conforme" : "Non conforme"}</span>
              </div>
              <div className="result-row">
                <div className="result-label">État général</div>
                <span className={`badge ${condClass}`}>{t(cert.condition)}</span>
              </div>
            </div>
          </div>

          {/* Anomalies */}
          <div className="section">
            <div className="section-title">Anomalies constatées</div>
            <div className="card">
              {anomalies.length === 0 ? (
                <div className="anomaly-ok">
                  <div className="anomaly-ok-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div className="anomaly-ok-text">Aucune anomalie constatée</div>
                </div>
              ) : (
                anomalies.map((a) => (
                  <div key={a} className="anomaly-item">
                    <div className="anomaly-icon">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                    <div className="anomaly-text">{t(a)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Observations */}
          {(cert.observations || cert.recommendations || cert.nextVisit) && (
            <div className="section">
              <div className="section-title">Observations & Recommandations</div>
              <div className="card card-filled">
                {cert.observations && <div className="obs-text">{cert.observations}</div>}
                {cert.recommendations && (
                  <>
                    <div className="obs-rec-label">Recommandations</div>
                    <div className="obs-rec-text">{cert.recommendations}</div>
                  </>
                )}
                {cert.nextVisit && (
                  <div className="next-visit">
                    📅 Prochain passage recommandé : {fmtDate(cert.nextVisit)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signatures */}
          <div className="sig-section">
            <div className="sig-grid">
              <div className="sig-block">
                <div className="sig-label">Le professionnel</div>
                <div className="sig-sub">Lu et approuvé</div>
                <div className="sig-box">
                  {cert.proSignature && <img src={cert.proSignature} className="sig-img" alt="Signature" />}
                </div>
                <div className="sig-name">{companyName}</div>
                <div className="sig-date">Date : {fmtDate(cert.date)}</div>
              </div>
              <div className="sig-block">
                <div className="sig-label">Le client</div>
                <div className="sig-sub">Lu et approuvé</div>
                <div className="sig-box">
                  {cert.clientSignature && <img src={cert.clientSignature} className="sig-img" alt="Signature" />}
                </div>
                <div className="sig-name">{clientName}</div>
                <div className="sig-date">Date : {fmtDate(cert.date)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-text">
            Établi conformément au décret n°2023-641 du 20 juillet 2023 relatif à l&apos;entretien des foyers, appareils et conduits de fumée
          </div>
          <div className="footer-text">
            Ce document doit être conservé pendant une durée minimale de 2 ans – Validité : {t(cert.periodicity).toLowerCase()}
          </div>
          <div className="footer-brand">Bistry – Logiciel de gestion pour ramoneurs</div>
        </div>
      </div>
    </>
  );
}
