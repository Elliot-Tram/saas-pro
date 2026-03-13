import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download, User, Home, Wrench, AlertTriangle, FileCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { DeleteCertificateButton } from "./DeleteCertificateButton";

const conditionLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  bon_etat: { label: "Bon état", variant: "success" },
  a_surveiller: { label: "À surveiller", variant: "warning" },
  dangereux: { label: "Dangereux", variant: "danger" },
};

const methodLabels: Record<string, string> = {
  mecanique_haut: "Mécanique par le haut",
  mecanique_bas: "Mécanique par le bas",
  chimique: "Chimique",
  mixte: "Mixte",
};

const qualityLabels: Record<string, string> = {
  proprietaire: "Propriétaire",
  locataire: "Locataire",
  syndic: "Syndic",
};

const anomalyLabels: Record<string, string> = {
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

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: { id, userId: session.userId },
    include: { client: true },
  });

  if (!certificate) notFound();

  const condition = conditionLabels[certificate.condition] || {
    label: certificate.condition,
    variant: "default" as const,
  };

  const anomalies = (certificate.anomalies as string[] | null) || [];

  return (
    <>
      <div className="mb-8">
        <Link
          href="/certificates"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux certificats
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{certificate.number}</h1>
              <Badge variant={condition.variant}>{condition.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Certificat du {formatDate(certificate.date)} — {qualityLabels[certificate.clientQuality] || certificate.clientQuality}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href={`/api/certificates/${certificate.id}/pdf`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <Download className="h-4 w-4" />
                Télécharger PDF
              </Button>
            </a>
            <DeleteCertificateButton id={certificate.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Client */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Client</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Nom" value={`${certificate.client.firstName} ${certificate.client.lastName}`} />
            <InfoRow
              label="Adresse"
              value={`${certificate.client.address}${certificate.client.postalCode ? `, ${certificate.client.postalCode}` : ""}${certificate.client.city ? ` ${certificate.client.city}` : ""}`}
            />
            {certificate.client.phone && <InfoRow label="Téléphone" value={certificate.client.phone} />}
            <InfoRow label="Qualité" value={qualityLabels[certificate.clientQuality] || certificate.clientQuality} />
          </CardContent>
        </Card>

        {/* Installation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Installation</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoRow label="Type d'appareil" value={certificate.chimneyType} />
            {certificate.fuelType && <InfoRow label="Combustible" value={certificate.fuelType} />}
            {certificate.chimneyLocation && <InfoRow label="Localisation" value={certificate.chimneyLocation} />}
            {certificate.applianceBrand && <InfoRow label="Marque" value={certificate.applianceBrand} />}
            {certificate.applianceModel && <InfoRow label="Modèle" value={certificate.applianceModel} />}
            {certificate.conduitType && <InfoRow label="Type de conduit" value={certificate.conduitType} />}
            {certificate.conduitDiameter && <InfoRow label="Diamètre" value={certificate.conduitDiameter} />}
            {certificate.conduitLength && <InfoRow label="Longueur" value={certificate.conduitLength} />}
          </CardContent>
        </Card>

        {/* Intervention & Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Intervention</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Méthode" value={methodLabels[certificate.method] || certificate.method} />
            <div>
              <p className="text-sm text-gray-500">Vacuité du conduit</p>
              <p className="text-sm font-medium mt-0.5">
                {certificate.vacuumTest ? (
                  <span className="text-green-700">Conforme ✓</span>
                ) : (
                  <span className="text-red-700">Non conforme ✗</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">État général</p>
              <div className="mt-1">
                <Badge variant={condition.variant}>{condition.label}</Badge>
              </div>
            </div>
            <InfoRow label="Périodicité" value={certificate.periodicity === "semestriel" ? "Semestriel" : "Annuel"} />
            {certificate.nextVisit && <InfoRow label="Prochain passage" value={formatDate(certificate.nextVisit)} />}
          </CardContent>
        </Card>

        {/* Anomalies */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Anomalies</h2>
            </div>
          </CardHeader>
          <CardContent>
            {anomalies.length === 0 ? (
              <p className="text-sm text-green-700">Aucune anomalie constatée ✓</p>
            ) : (
              <ul className="space-y-2">
                {anomalies.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-0.5">✗</span>
                    {anomalyLabels[a] || a}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Observations & Recommendations */}
        {(certificate.observations || certificate.recommendations) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Observations & Recommandations</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificate.observations && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Observations</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{certificate.observations}</p>
                </div>
              )}
              {certificate.recommendations && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recommandations</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{certificate.recommendations}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Signatures */}
        {(certificate.proSignature || certificate.clientSignature) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Signatures</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Le professionnel</p>
                  {certificate.proSignature ? (
                    <img src={certificate.proSignature} alt="Signature pro" className="h-20 border rounded-lg p-2 bg-gray-50" />
                  ) : (
                    <p className="text-sm text-gray-400 italic">Non signé</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Le client</p>
                  {certificate.clientSignature ? (
                    <img src={certificate.clientSignature} alt="Signature client" className="h-20 border rounded-lg p-2 bg-gray-50" />
                  ) : (
                    <p className="text-sm text-gray-400 italic">Non signé</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
