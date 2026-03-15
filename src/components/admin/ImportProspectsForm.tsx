"use client";

import { useActionState, useState, useRef } from "react";
import { importProspects } from "@/app/actions/prospects";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, CheckCircle2, Download } from "lucide-react";

interface ParsedRow {
  company: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  googleMaps: string;
  website: string;
}

export function ImportProspectsForm() {
  const [state, formAction, isPending] = useActionState(importProspects, null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [csvRaw, setCsvRaw] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function parseCsv(text: string): ParsedRow[] {
    // Remove BOM if present
    const cleaned = text.replace(/^\uFEFF/, "");
    const lines = cleaned
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) return [];

    // Skip header row
    const dataLines = lines.slice(1);
    const rows: ParsedRow[] = [];

    for (const line of dataLines) {
      const separator = line.includes(";") ? ";" : ",";
      const cols = line.split(separator).map((c) => c.trim());

      if (!cols[0]) continue;

      rows.push({
        company: cols[0] || "",
        phone: cols[1] || "",
        email: cols[2] || "",
        address: cols[3] || "",
        city: cols[4] || "",
        postalCode: cols[5] || "",
        googleMaps: cols[6] || "",
        website: cols[7] || "",
      });
    }

    return rows;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setCsvRaw(text);
      try {
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setParseError(
            "Aucune donnee trouvee. Verifiez le format du fichier CSV."
          );
          setParsedRows([]);
          return;
        }
        setParsedRows(rows);
      } catch {
        setParseError("Erreur lors de la lecture du fichier CSV.");
        setParsedRows([]);
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  if (state?.success) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Import termine
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {state.count} prospect{state.count > 1 ? "s" : ""} importe{state.count > 1 ? "s" : ""} avec succes
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <a href="/admin/prospects">
                <Button variant="primary">Voir les prospects</Button>
              </a>
              <a href="/admin/prospects/import">
                <Button variant="secondary">Nouvel import</Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template download */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Modele CSV</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Telecharger le modele pour preparer votre fichier
              </p>
            </div>
            <a href="/api/admin/prospects-template">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Telecharger
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* File upload */}
      <Card>
        <CardContent>
          <form action={formAction} className="space-y-5">
            {state?.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {state.error}
              </div>
            )}

            {parseError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {parseError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier CSV
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
              >
                {fileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {fileName}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({parsedRows.length} prospect{parsedRows.length > 1 ? "s" : ""})
                    </span>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Cliquez pour choisir un fichier CSV
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Colonnes attendues : Entreprise, Telephone, Email, Adresse,
                      Ville, Code postal, Google Maps, Site web
                    </p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Hidden field with raw CSV data */}
            <input type="hidden" name="csvData" value={csvRaw} />

            {/* Preview */}
            {parsedRows.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Apercu ({Math.min(5, parsedRows.length)} sur {parsedRows.length})
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-left">
                        <th className="px-3 py-2 font-medium text-gray-500">
                          Entreprise
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          Ville
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          Telephone
                        </th>
                        <th className="px-3 py-2 font-medium text-gray-500">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {row.company}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.city || "--"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.phone || "--"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {row.email || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                loading={isPending}
                disabled={parsedRows.length === 0}
                className="w-full"
              >
                <Upload className="h-4 w-4" />
                Importer {parsedRows.length} prospect{parsedRows.length > 1 ? "s" : ""}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
