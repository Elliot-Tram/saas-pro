"use client";

import { useState, useRef, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { importClients } from "@/app/actions/import";

interface ParsedRow {
  prénom: string;
  nom: string;
  email: string;
  téléphone: string;
  adresse: string;
  ville: string;
  "code postal": string;
  secteur: string;
  "type cheminée": string;
  combustible: string;
  notes: string;
  [key: string]: string;
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  // Remove UTF-8 BOM if present
  let content = text;
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  // Detect separator: if the header line contains more semicolons than commas, use semicolons
  const headerLine = lines[0];
  const separator =
    (headerLine.match(/;/g) || []).length >=
    (headerLine.match(/,/g) || []).length
      ? ";"
      : ",";

  function splitLine(line: string): string[] {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === separator) {
          fields.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    fields.push(current.trim());
    return fields;
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    // Skip rows where both prénom and nom are empty
    if (!row["prénom"] && !row["nom"]) continue;
    rows.push(row as ParsedRow);
  }

  return { headers, rows };
}

export function ImportClientsForm() {
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: ParsedRow[];
  } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(importClients, null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const result = parseCSV(text);
      setParsedData(result);
    };
    reader.readAsText(file, "UTF-8");
  }

  const displayHeaders = [
    "prénom",
    "nom",
    "email",
    "téléphone",
    "adresse",
    "ville",
    "code postal",
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fichier CSV
        </label>
        <div
          className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            {fileName ? (
              <p className="text-sm text-gray-700 font-medium">{fileName}</p>
            ) : (
              <p className="text-sm text-gray-500">
                Cliquez pour sélectionner un fichier CSV
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {parsedData && parsedData.rows.length > 0 && (
        <>
          <div className="rounded-lg bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-blue-800">
              {parsedData.rows.length} client{parsedData.rows.length > 1 ? "s" : ""}{" "}
              détecté{parsedData.rows.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {displayHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-600 capitalize whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedData.rows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {displayHeaders.map((h) => (
                      <td
                        key={h}
                        className="px-3 py-2 text-gray-700 whitespace-nowrap"
                      >
                        {row[h] || (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.rows.length > 5 && (
              <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
                ... et {parsedData.rows.length - 5} autre{parsedData.rows.length - 5 > 1 ? "s" : ""} client{parsedData.rows.length - 5 > 1 ? "s" : ""}
              </div>
            )}
          </div>

          <form action={formAction}>
            <input type="hidden" name="csvContent" value={csvContent} />
            <Button type="submit" loading={isPending} disabled={isPending}>
              <Upload className="h-4 w-4" />
              {isPending
                ? "Importation en cours..."
                : `Importer ${parsedData.rows.length} client${parsedData.rows.length > 1 ? "s" : ""}`}
            </Button>
          </form>
        </>
      )}

      {parsedData && parsedData.rows.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Aucun client trouvé dans le fichier. Vérifiez le format de votre CSV.
          </p>
        </div>
      )}

      {state?.success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">
            {state.count} client{(state.count ?? 0) > 1 ? "s" : ""} importé{(state.count ?? 0) > 1 ? "s" : ""} avec
            succès !
          </p>
        </div>
      )}

      {state?.error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}
    </div>
  );
}
