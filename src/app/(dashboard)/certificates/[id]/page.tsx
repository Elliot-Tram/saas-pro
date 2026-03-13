import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Download, Trash2, User, Home, Flame, FileCheck } from "lucide-react";
import Link from "next/link";
import { DeleteCertificateButton } from "./DeleteCertificateButton";

const conditionLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  bon_etat: { label: "Bon état", variant: "success" },
  a_surveiller: { label: "À surveiller", variant: "warning" },
  dangereux: { label: "Dangereux", variant: "danger" },
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
              <h1 className="text-2xl font-bold text-gray-900">
                {certificate.number}
              </h1>
              <Badge variant={condition.variant}>{condition.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Certificat du {formatDate(certificate.date)}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Client</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nom</p>
              <p className="text-sm font-medium text-gray-900">
                {certificate.client.firstName} {certificate.client.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Adresse</p>
              <p className="text-sm font-medium text-gray-900">
                {certificate.client.address}
                {certificate.client.postalCode && `, ${certificate.client.postalCode}`}
                {certificate.client.city && ` ${certificate.client.city}`}
              </p>
            </div>
            {certificate.client.phone && (
              <div>
                <p className="text-sm text-gray-500">Téléphone</p>
                <p className="text-sm font-medium text-gray-900">
                  {certificate.client.phone}
                </p>
              </div>
            )}
            {certificate.client.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">
                  {certificate.client.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chimney Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Conduit</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Type de cheminée</p>
              <p className="text-sm font-medium text-gray-900">
                {certificate.chimneyType}
              </p>
            </div>
            {certificate.chimneyLocation && (
              <div>
                <p className="text-sm text-gray-500">Emplacement</p>
                <p className="text-sm font-medium text-gray-900">
                  {certificate.chimneyLocation}
                </p>
              </div>
            )}
            {certificate.fuelType && (
              <div>
                <p className="text-sm text-gray-500">Combustible</p>
                <p className="text-sm font-medium text-gray-900">
                  {certificate.fuelType}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assessment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Évaluation</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">État du conduit</p>
              <div className="mt-1">
                <Badge variant={condition.variant}>{condition.label}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Test de vacuité</p>
              <p className="text-sm font-medium text-gray-900">
                {certificate.vacuumTest ? (
                  <span className="text-green-700">Conforme</span>
                ) : (
                  <span className="text-red-700">Non conforme</span>
                )}
              </p>
            </div>
            {certificate.nextVisit && (
              <div>
                <p className="text-sm text-gray-500">Prochaine visite</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(certificate.nextVisit)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Observations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Observations</h2>
            </div>
          </CardHeader>
          <CardContent>
            {certificate.observations ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {certificate.observations}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic">
                Aucune observation
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
