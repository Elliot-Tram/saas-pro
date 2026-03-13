import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, FileSpreadsheet } from "lucide-react";
import { ImportClientsForm } from "@/components/clients/ImportClientsForm";

export default async function ImportClientsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <Header
        title="Importer des clients"
        description="Importez votre fichier clients depuis un CSV ou un autre logiciel."
      />

      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">
                  Format attendu
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  Votre fichier CSV doit contenir les colonnes suivantes
                  (séparées par <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">;</code> ou <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">,</code>) :
                </p>
                <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          "Prénom",
                          "Nom",
                          "Email",
                          "Téléphone",
                          "Adresse",
                          "Ville",
                          "Code postal",
                          "Secteur",
                          "Type cheminée",
                          "Combustible",
                          "Notes",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="px-3 py-2 text-gray-500">Jean</td>
                        <td className="px-3 py-2 text-gray-500">Dupont</td>
                        <td className="px-3 py-2 text-gray-500">jean@exemple.fr</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">06 12 34 56 78</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">12 rue des Lilas</td>
                        <td className="px-3 py-2 text-gray-500">Annecy</td>
                        <td className="px-3 py-2 text-gray-500">74000</td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">Annecy Nord</td>
                        <td className="px-3 py-2 text-gray-500">Insert</td>
                        <td className="px-3 py-2 text-gray-500">Bois</td>
                        <td className="px-3 py-2 text-gray-500">Client fidèle</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Seuls <strong>Prénom</strong>, <strong>Nom</strong> et{" "}
                  <strong>Adresse</strong> sont obligatoires. Les autres colonnes
                  sont optionnelles.
                </p>
                <a href="/api/import/template" download>
                  <Button variant="secondary" size="sm">
                    <Download className="h-4 w-4" />
                    Télécharger le modèle CSV
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <ImportClientsForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
