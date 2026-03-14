import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Bell, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { SendReminderButton } from "@/components/reminders/SendReminderButton";

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const clients = await prisma.client.findMany({
    where: {
      teamId: session.teamId,
      OR: [
        { lastVisit: null },
        { lastVisit: { lt: elevenMonthsAgo } },
        { nextReminder: { lte: now } },
      ],
    },
    orderBy: { lastVisit: "asc" },
  });

  // Sort: never visited first (null lastVisit), then by most overdue
  const sortedClients = [...clients].sort((a, b) => {
    if (!a.lastVisit && !b.lastVisit) return 0;
    if (!a.lastVisit) return -1;
    if (!b.lastVisit) return -1;
    return a.lastVisit.getTime() - b.lastVisit.getTime();
  });

  function getDaysOverdue(lastVisit: Date | null): number | null {
    if (!lastVisit) return null;
    const oneYearAfter = new Date(lastVisit);
    oneYearAfter.setFullYear(oneYearAfter.getFullYear() + 1);
    const diffMs = now.getTime() - oneYearAfter.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  function getUrgency(lastVisit: Date | null): {
    label: string;
    variant: "danger" | "warning" | "default";
  } {
    if (!lastVisit) {
      return { label: "Jamais visité", variant: "default" };
    }
    const monthsAgo =
      (now.getFullYear() - lastVisit.getFullYear()) * 12 +
      (now.getMonth() - lastVisit.getMonth());
    if (monthsAgo > 12) {
      return { label: "En retard", variant: "danger" };
    }
    return { label: "Bientôt dû", variant: "warning" };
  }

  return (
    <>
      <Header
        title="Rappels annuels"
        description="Clients à relancer pour leur ramonage annuel"
      />

      {sortedClients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Aucun rappel"
            description="Tous vos clients sont à jour pour leur ramonage annuel."
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier passage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jours de retard
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sortedClients.map((client) => {
                  const daysOverdue = getDaysOverdue(client.lastVisit);
                  const urgency = getUrgency(client.lastVisit);

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/clients/${client.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-600">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {client.lastName} {client.firstName}
                            </p>
                            {client.email && (
                              <p className="text-xs text-gray-500">
                                {client.email}
                              </p>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {client.address}
                            {client.city && `, ${client.city}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {client.lastVisit ? (
                          <span className="text-sm text-gray-600">
                            {formatDate(client.lastVisit)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Jamais</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={urgency.variant}>
                          {daysOverdue !== null
                            ? daysOverdue > 0
                              ? `${daysOverdue} jours`
                              : "Bientôt dû"
                            : urgency.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <SendReminderButton
                            clientId={client.id}
                            clientEmail={client.email}
                            clientName={`${client.firstName} ${client.lastName}`}
                          />
                          <Link href="/calendar">
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                              Planifier RDV
                            </Button>
                          </Link>
                        </div>
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
