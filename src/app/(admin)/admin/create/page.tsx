import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateProspectForm } from "@/components/admin/CreateProspectForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CreateProspectPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

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
        <h1 className="text-2xl font-bold text-gray-900">
          Creer un compte prospect
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Creez un compte pour un nouveau prospect avec un mot de passe
          temporaire
        </p>
      </div>

      <div className="max-w-xl">
        <CreateProspectForm />
      </div>
    </>
  );
}
