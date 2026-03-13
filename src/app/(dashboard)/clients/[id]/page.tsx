import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteClient } from "@/app/actions/clients";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Flame,
  StickyNote,
  Calendar,
  FileText,
  Award,
  FileSignature,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
    include: {
      appointments: {
        orderBy: { date: "desc" },
      },
      invoices: {
        orderBy: { date: "desc" },
        include: { items: true },
      },
      certificates: {
        orderBy: { date: "desc" },
      },
      contracts: {
        where: { status: "active" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  const deleteWithId = deleteClient.bind(null, client.id);

  // --- Computed stats ---
  const interventionCount = client.appointments.length;
  const certificateCount = client.certificates.length;
  const caTotal = client.invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.total, 0);
  const activeContract = client.contracts.length > 0 ? client.contracts[0] : null;

  // --- Unified timeline ---
  type TimelineEntry = {
    id: string;
    date: Date;
    type: "RDV" | "Certificat" | "Facture";
    description: string;
    status: string;
    statusVariant: "default" | "success" | "warning" | "danger" | "info";
    href?: string;
  };

  const timeline: TimelineEntry[] = [];

  for (const apt of client.appointments) {
    timeline.push({
      id: `apt-${apt.id}`,
      date: apt.date,
      type: "RDV",
      description: apt.title + (apt.description ? ` — ${apt.description}` : ""),
      status:
        apt.status === "scheduled"
          ? "Planifié"
          : apt.status === "completed"
            ? "Terminé"
            : apt.status === "cancelled"
              ? "Annulé"
              : apt.status,
      statusVariant:
        apt.status === "scheduled"
          ? "info"
          : apt.status === "completed"
            ? "success"
            : apt.status === "cancelled"
              ? "danger"
              : "default",
    });
  }

  for (const cert of client.certificates) {
    timeline.push({
      id: `cert-${cert.id}`,
      date: cert.date,
      type: "Certificat",
      description: `${cert.number} — ${cert.chimneyType}${cert.fuelType ? ` (${cert.fuelType})` : ""}`,
      status:
        cert.condition === "bon_etat"
          ? "Bon état"
          : cert.condition === "a_surveiller"
            ? "À surveiller"
            : "Dangereux",
      statusVariant:
        cert.condition === "bon_etat"
          ? "success"
          : cert.condition === "a_surveiller"
            ? "warning"
            : "danger",
      href: `/certificates/${cert.id}`,
    });
  }

  for (const inv of client.invoices) {
    timeline.push({
      id: `inv-${inv.id}`,
      date: inv.date,
      type: "Facture",
      description: `${inv.number} — ${formatCurrency(inv.total)}`,
      status:
        inv.status === "draft"
          ? "Brouillon"
          : inv.status === "sent"
            ? "Envoyée"
            : inv.status === "paid"
              ? "Payée"
              : inv.status,
      statusVariant:
        inv.status === "draft"
          ? "default"
          : inv.status === "sent"
            ? "warning"
            : inv.status === "paid"
              ? "success"
              : "default",
      href: `/invoices/${inv.id}`,
    });
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeBadgeVariant: Record<string, "info" | "success" | "warning"> = {
    RDV: "info",
    Certificat: "success",
    Facture: "warning",
  };

  return (
    <>
      {/* Top navigation */}
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux clients
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-600">
              {client.firstName[0]}
              {client.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.firstName} {client.lastName}
              </h1>
              {client.city && (
                <p className="text-sm text-gray-500">{client.city}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/clients/${client.id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Modifier
              </Button>
            </Link>
            <form action={deleteWithId}>
              <Button type="submit" variant="danger">
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Interventions</p>
              <p className="text-xl font-bold text-gray-900">{interventionCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="rounded-lg bg-green-50 p-2">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Certificats</p>
              <p className="text-xl font-bold text-gray-900">{certificateCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">CA total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(caTotal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <FileSignature className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Contrat</p>
              <p className="text-xl font-bold text-gray-900">
                {activeContract ? (
                  <Badge variant="success">Actif</Badge>
                ) : (
                  <span className="text-sm font-medium text-gray-400">Aucun</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info - left column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Informations</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {client.email}
                    </a>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Téléphone</p>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-sm text-gray-900"
                    >
                      {client.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-50 p-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Adresse</p>
                  <p className="text-sm text-gray-900">
                    {client.address}
                    {client.postalCode || client.city
                      ? `, ${[client.postalCode, client.city].filter(Boolean).join(" ")}`
                      : ""}
                  </p>
                </div>
              </div>

              {client.sector && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Secteur</p>
                    <Badge variant="success">{client.sector}</Badge>
                  </div>
                </div>
              )}

              {(client.chimneyType || client.fuelType) && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Flame className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Installation</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {client.chimneyType && (
                        <Badge variant="info">{client.chimneyType}</Badge>
                      )}
                      {client.fuelType && (
                        <Badge>{client.fuelType}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {client.lastVisit && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dernier passage</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(client.lastVisit)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {client.notes && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-gray-400" />
                  <h2 className="font-semibold text-gray-900">Notes</h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {client.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active contract */}
          {activeContract && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-gray-400" />
                    <h2 className="font-semibold text-gray-900">Contrat actif</h2>
                  </div>
                  <Badge variant="success">Actif</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Numéro</span>
                  <span className="font-medium text-gray-900">{activeContract.number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Période</span>
                  <span className="text-gray-900">
                    {formatDate(activeContract.startDate)} - {formatDate(activeContract.endDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(activeContract.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Visites effectuées</span>
                  <span className="text-gray-900">
                    {activeContract.visitsDone}/{activeContract.visits}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (activeContract.visitsDone / activeContract.visits) * 100)}%`,
                    }}
                  />
                </div>
                {activeContract.description && (
                  <p className="text-xs text-gray-500 pt-1">{activeContract.description}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Unified timeline */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">
                  Historique des interventions
                </h2>
                <span className="text-xs text-gray-400 ml-auto">
                  {timeline.length} entrée{timeline.length !== 1 ? "s" : ""}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {timeline.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Aucun historique enregistré
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {timeline.map((entry) => (
                    <li
                      key={entry.id}
                      className="px-6 py-3 flex items-start gap-4 hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Date column */}
                      <div className="flex-shrink-0 w-20 pt-0.5">
                        <span className="text-xs text-gray-500">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      {/* Type badge */}
                      <div className="flex-shrink-0 w-24">
                        <Badge variant={typeBadgeVariant[entry.type] || "default"}>
                          {entry.type}
                        </Badge>
                      </div>
                      {/* Description */}
                      <div className="flex-1 min-w-0">
                        {entry.href ? (
                          <Link
                            href={entry.href}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate block"
                          >
                            {entry.description}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-900 truncate">
                            {entry.description}
                          </p>
                        )}
                      </div>
                      {/* Status */}
                      <div className="flex-shrink-0">
                        <Badge variant={entry.statusVariant}>
                          {entry.status}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
