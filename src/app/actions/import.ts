"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ImportState {
  success?: boolean;
  count?: number;
  error?: string;
}

const COLUMN_MAP: Record<string, string> = {
  "prénom": "firstName",
  "prenom": "firstName",
  "nom": "lastName",
  "email": "email",
  "téléphone": "phone",
  "telephone": "phone",
  "adresse": "address",
  "ville": "city",
  "code postal": "postalCode",
  "code_postal": "postalCode",
  "codepostal": "postalCode",
  "secteur": "sector",
  "type cheminée": "chimneyType",
  "type_cheminée": "chimneyType",
  "type cheminee": "chimneyType",
  "combustible": "fuelType",
  "notes": "notes",
};

function parseCsvLine(line: string, separator: string): string[] {
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

export async function importClients(
  _prevState: ImportState | null,
  formData: FormData
): Promise<ImportState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const csvContent = formData.get("csvContent") as string;
  if (!csvContent || csvContent.trim() === "") {
    return { error: "Aucun contenu CSV fourni." };
  }

  try {
    // Remove UTF-8 BOM if present
    let content = csvContent;
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const lines = content.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) {
      return { error: "Le fichier doit contenir au moins un en-tête et une ligne de données." };
    }

    // Detect separator
    const headerLine = lines[0];
    const separator =
      (headerLine.match(/;/g) || []).length >=
      (headerLine.match(/,/g) || []).length
        ? ";"
        : ",";

    const headers = parseCsvLine(lines[0], separator).map((h) =>
      h.toLowerCase().trim()
    );

    // Map headers to field names
    const fieldIndices: Record<string, number> = {};
    headers.forEach((header, idx) => {
      const mapped = COLUMN_MAP[header];
      if (mapped) {
        fieldIndices[mapped] = idx;
      }
    });

    // Validate required columns exist
    if (fieldIndices["firstName"] === undefined) {
      return { error: "Colonne \"Prénom\" introuvable dans le fichier." };
    }
    if (fieldIndices["lastName"] === undefined) {
      return { error: "Colonne \"Nom\" introuvable dans le fichier." };
    }
    if (fieldIndices["address"] === undefined) {
      return { error: "Colonne \"Adresse\" introuvable dans le fichier." };
    }

    const clientsData: {
      firstName: string;
      lastName: string;
      email: string | null;
      phone: string | null;
      address: string;
      city: string | null;
      postalCode: string | null;
      sector: string | null;
      chimneyType: string | null;
      fuelType: string | null;
      notes: string | null;
      userId: string;
    }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i], separator);

      const getValue = (field: string): string => {
        const idx = fieldIndices[field];
        if (idx === undefined) return "";
        return values[idx] || "";
      };

      const firstName = getValue("firstName");
      const lastName = getValue("lastName");
      const address = getValue("address");

      // Skip rows where required fields are empty
      if (!firstName && !lastName) continue;

      clientsData.push({
        firstName: firstName || "",
        lastName: lastName || "",
        email: getValue("email") || null,
        phone: getValue("phone") || null,
        address: address || "",
        city: getValue("city") || null,
        postalCode: getValue("postalCode") || null,
        sector: getValue("sector") || null,
        chimneyType: getValue("chimneyType") || null,
        fuelType: getValue("fuelType") || null,
        notes: getValue("notes") || null,
        userId: session.userId,
      });
    }

    if (clientsData.length === 0) {
      return { error: "Aucun client valide trouvé dans le fichier." };
    }

    // Create all clients in a transaction
    await prisma.$transaction(
      clientsData.map((data) => prisma.client.create({ data }))
    );

    return { success: true, count: clientsData.length };
  } catch (err) {
    console.error("Import error:", err);
    return {
      error: "Une erreur est survenue lors de l'importation. Vérifiez le format de votre fichier.",
    };
  }
}
