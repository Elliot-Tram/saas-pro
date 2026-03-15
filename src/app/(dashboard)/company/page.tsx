import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  UsersRound,
  MapPin,
  FileSignature,
  BarChart3,
  Bell,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function CompanyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "admin") {
    redirect("/");
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const [team, memberCount, sectorCount, activeContracts, paidInvoicesThisMonth, certificatesThisMonth, remindersCount] =
    await Promise.all([
      prisma.team.findUnique({
        where: { id: session.teamId },
        select: {
          company: true,
          siret: true,
          address: true,
          city: true,
          postalCode: true,
          insurerName: true,
          logo: true,
        },
      }),
      prisma.user.count({
        where: { teamId: session.teamId },
      }),
      prisma.client
        .findMany({
          where: { teamId: session.teamId, sector: { not: null } },
          select: { sector: true },
          distinct: ["sector"],
        })
        .then((rows) => rows.length),
      prisma.contract.count({
        where: { teamId: session.teamId, status: "active" },
      }),
      prisma.invoice.findMany({
        where: {
          teamId: session.teamId,
          status: "paid",
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { total: true },
      }),
      prisma.certificate.count({
        where: {
          teamId: session.teamId,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.client.count({
        where: {
          teamId: session.teamId,
          OR: [
            { lastVisit: null },
            { lastVisit: { lt: elevenMonthsAgo } },
            { nextReminder: { lte: now } },
          ],
        },
      }),
    ]);

  const caThisMonth = paidInvoicesThisMonth.reduce((sum, inv) => sum + inv.total, 0);

  const companyInfo = [
    team?.company,
    team?.siret ? `SIRET ${team.siret}` : null,
    [team?.address, team?.city, team?.postalCode].filter(Boolean).join(", ") || null,
    team?.insurerName ? `Assurance : ${team.insurerName}` : null,
  ].filter(Boolean);

  const sections = [
    {
      title: "Informations",
      description:
        companyInfo.length > 0
          ? companyInfo.join(" - ")
          : "Logo, SIRET, adresse, assurance",
      icon: Building2,
      href: "/settings",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Mon équipe",
      description: `${memberCount} membre${memberCount > 1 ? "s" : ""}`,
      icon: UsersRound,
      href: "/team",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Mes zones",
      description: `${sectorCount} secteur${sectorCount > 1 ? "s" : ""}`,
      icon: MapPin,
      href: "/sectors",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Mes contrats",
      description: `${activeContracts} contrat${activeContracts > 1 ? "s" : ""} actif${activeContracts > 1 ? "s" : ""}`,
      icon: FileSignature,
      href: "/contracts",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      title: "Mon chiffre",
      description: `CA du mois : ${formatCurrency(caThisMonth)} - ${certificatesThisMonth} certificat${certificatesThisMonth > 1 ? "s" : ""} ce mois`,
      icon: BarChart3,
      href: "/stats",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Rappels",
      description: `${remindersCount} client${remindersCount > 1 ? "s" : ""} à relancer`,
      icon: Bell,
      href: "/reminders",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <>
      <Header
        title="Mon entreprise"
        description="Gérez votre entreprise et vos paramètres"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-4 py-5">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2.5 ${section.bg}`}>
                    <section.icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {section.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
