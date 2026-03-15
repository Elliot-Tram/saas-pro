import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportProspectsForm } from "@/components/admin/ImportProspectsForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ImportProspectsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.email !== process.env.ADMIN_EMAIL) redirect("/");

  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin/prospects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux prospects
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Importer des prospects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Importez un fichier CSV contenant vos prospects
        </p>
      </div>

      <div className="max-w-2xl">
        <ImportProspectsForm />
      </div>
    </>
  );
}
