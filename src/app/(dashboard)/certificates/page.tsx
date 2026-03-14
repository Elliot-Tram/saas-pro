import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { ClipboardCheck, Plus, Eye } from "lucide-react";
import Link from "next/link";

const conditionLabels: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  bon_etat: { label: "Bon état", variant: "success" },
  a_surveiller: { label: "À surveiller", variant: "warning" },
  dangereux: { label: "Dangereux", variant: "danger" },
};

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { teamId: session.teamId },
    include: { client: true },
    orderBy: { date: "desc" },
  });

  return (
    <>
      <Header title="Certificats" description="Gérez vos certificats de ramonage">
        <Link href="/certificates/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nouveau certificat
          </Button>
        </Link>
      </Header>

      {certificates.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardCheck}
            title="Aucun certificat"
            description="Créez votre premier certificat de ramonage pour commencer."
            actionLabel="Créer un certificat"
            actionHref="/certificates/new"
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type cheminée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    État
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {certificates.map((cert) => {
                  const condition = conditionLabels[cert.condition] || {
                    label: cert.condition,
                    variant: "default" as const,
                  };
                  return (
                    <tr
                      key={cert.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/certificates/${cert.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {cert.number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                            {cert.client.firstName[0]}
                            {cert.client.lastName[0]}
                          </div>
                          <span className="text-sm text-gray-900">
                            {cert.client.lastName} {cert.client.firstName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(cert.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="info">{cert.chimneyType}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={condition.variant}>
                          {condition.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/certificates/${cert.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            Voir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
