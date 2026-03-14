import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { InviteMemberForm } from "@/components/team/InviteMemberForm";

export default async function InviteMemberPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role !== "admin") {
    redirect("/");
  }

  return (
    <>
      <Header title="Inviter un membre" description="Ajoutez un nouveau membre à votre équipe" />
      <InviteMemberForm />
    </>
  );
}
