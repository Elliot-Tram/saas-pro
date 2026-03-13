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
        take: 10,
      },
      invoices: {
        orderBy: { date: "desc" },
        take: 10,
      },
      certificates: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!client) notFound();

  const deleteWithId = deleteClient.bind(null, client.id);

  const statusLabels: Record<string, string> = {
    scheduled: "Planifié",
    completed: "Terminé",
    cancelled: "Annulé",
    draft: "Brouillon",
    sent: "Envoyée",
    paid: "Payée",
  };

  const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
    scheduled: "info",
    completed: "success",
    cancelled: "danger",
    draft: "default",
    sent: "warning",
    paid: "success",
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
        </div>

        {/* Right column - Historique & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointments history */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">
                  Historique des rendez-vous
                </h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {client.appointments.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Aucun rendez-vous enregistré
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {client.appointments.map((apt) => (
                    <li
                      key={apt.id}
                      className="px-6 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {apt.title}
                        </p>
                        {apt.description && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {apt.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={statusVariants[apt.status] || "default"}
                        >
                          {statusLabels[apt.status] || apt.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(apt.date)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Factures</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Aucune facture enregistrée
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {client.invoices.map((inv) => (
                    <li
                      key={inv.id}
                      className="px-6 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inv.number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(inv.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={statusVariants[inv.status] || "default"}
                        >
                          {statusLabels[inv.status] || inv.status}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(inv.total)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Certificates */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900">Certificats</h2>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {client.certificates.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">
                  Aucun certificat enregistré
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {client.certificates.map((cert) => (
                    <li
                      key={cert.id}
                      className="px-6 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {cert.number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {cert.chimneyType}
                          {cert.fuelType && ` - ${cert.fuelType}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            cert.condition === "bon_etat"
                              ? "success"
                              : cert.condition === "a_surveiller"
                                ? "warning"
                                : "danger"
                          }
                        >
                          {cert.condition === "bon_etat"
                            ? "Bon état"
                            : cert.condition === "a_surveiller"
                              ? "À surveiller"
                              : "Dangereux"}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(cert.date)}
                        </span>
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
