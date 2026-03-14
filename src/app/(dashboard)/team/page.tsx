import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserPlus } from "lucide-react";
import { RemoveMemberButton } from "@/components/team/RemoveMemberButton";

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "admin") {
    redirect("/");
  }

  const members = await prisma.user.findMany({
    where: { teamId: session.teamId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <>
      <Header title="Équipe" description="Gérez les membres de votre équipe">
        <Link href="/team/invite">
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            Inviter un membre
          </Button>
        </Link>
      </Header>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d&apos;ajout
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {member.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.role === "admin" ? (
                        <Badge variant="info">Administrateur</Badge>
                      ) : (
                        <Badge variant="default">Membre</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(member.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {member.id !== session.userId && (
                        <RemoveMemberButton memberId={member.id} memberName={member.name} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
