import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  FileText,
  Users,
  ClipboardCheck,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

  const { teamId } = await params;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          clients: true,
          certificates: true,
          invoices: true,
          appointments: true,
          contracts: true,
          quotes: true,
        },
      },
    },
  });

  if (!team) notFound();

  // Get last activity (most recent appointment, invoice, or certificate)
  const [lastCertificate, lastInvoice] = await Promise.all([
    prisma.certificate.findFirst({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    prisma.invoice.findFirst({
      where: { teamId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const lastActivityDate = [
    lastCertificate?.createdAt,
    lastInvoice?.createdAt,
  ]
    .filter(Boolean)
    .sort((a, b) => b!.getTime() - a!.getTime())[0];

  const infoItems = [
    { label: "Entreprise", value: team.company || team.name, icon: Building2 },
    { label: "SIRET", value: team.siret, icon: FileText },
    { label: "Telephone", value: team.phone, icon: Phone },
    {
      label: "Adresse",
      value: [team.address, team.postalCode, team.city]
        .filter(Boolean)
        .join(", "),
      icon: MapPin,
    },
  ].filter((item) => item.value);

  const activityStats = [
    { label: "Clients", value: team._count.clients },
    { label: "Certificats", value: team._count.certificates },
    { label: "Factures", value: team._count.invoices },
    { label: "Devis", value: team._count.quotes },
    { label: "RDV", value: team._count.appointments },
    { label: "Contrats", value: team._count.contracts },
  ];

  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            {team.company || team.name}
          </h1>
          <Badge variant="info">
            {team._count.clients} client{team._count.clients !== 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Inscrit le {formatDate(team.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Info + Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Team Info */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Informations
              </h2>
            </div>
            <CardContent className="space-y-4">
              {infoItems.length > 0 ? (
                infoItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <item.icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-gray-900">{item.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">Aucune information renseignee</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Activite</h2>
            </div>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {activityStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
              {lastActivityDate && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Derniere activite : {formatDate(lastActivityDate)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Members */}
        <div className="lg:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Membres ({team.members.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="px-6 py-3 font-medium text-gray-500">
                      Nom
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500">
                      Email
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500">
                      Role
                    </th>
                    <th className="px-6 py-3 font-medium text-gray-500">
                      Inscrit le
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {team.members.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <span className="font-medium text-gray-900">
                            {member.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            member.role === "admin" ? "info" : "default"
                          }
                        >
                          {member.role === "admin"
                            ? "Administrateur"
                            : "Membre"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(member.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {team.members.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        Aucun membre
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
