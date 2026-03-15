"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acces non autorise");
  }
  return session;
}

export async function importProspects(
  _prevState: unknown,
  formData: FormData
) {
  try {
    await checkAdmin();
  } catch {
    return { error: "Acces non autorise" };
  }

  const csvData = formData.get("csvData") as string;
  if (!csvData) {
    return { error: "Aucune donnee CSV fournie" };
  }

  try {
    const rows = csvData
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    if (rows.length < 2) {
      return { error: "Le fichier CSV doit contenir au moins une ligne de donnees" };
    }

    // Detect separator from header
    const headerRow = rows[0];
    const separator = headerRow.includes(";") ? ";" : ",";
    const headers = headerRow.split(separator).map((h) => h.trim().toLowerCase().replace(/[éè]/g, "e").replace(/[àâ]/g, "a").replace(/[ô]/g, "o"));

    // Map column names to indices
    const colMap: Record<string, number> = {};
    headers.forEach((h, i) => {
      if (h === "nom" || h === "entreprise" || h === "company") colMap.company = i;
      if ((h.includes("adresse") || h === "address") && !h.includes("email")) colMap.address = colMap.address ?? i;
      if (h === "ville" || h === "city") colMap.city = i;
      if (h.includes("code postal") || h === "postal") colMap.postalCode = i;
      if (h.includes("telephone principal") || h === "telephone" || h === "phone") colMap.phone = colMap.phone ?? i;
      if (h.includes("email")) colMap.email = colMap.email ?? i;
      if (h === "site web" || h === "website") colMap.website = i;
      if (h.includes("url google") || h.includes("google maps")) colMap.googleMapsUrl = i;
    });

    if (colMap.company === undefined) {
      return { error: "Colonne 'Nom' ou 'Entreprise' introuvable dans le CSV" };
    }

    const dataRows = rows.slice(1);
    let count = 0;

    for (const row of dataRows) {
      const cols = row.split(separator).map((col) => col.trim());

      const company = cols[colMap.company];
      if (!company) continue;

      const email = colMap.email !== undefined ? cols[colMap.email]?.split("|")[0]?.trim() : null;
      const phone = colMap.phone !== undefined ? cols[colMap.phone] : null;

      await prisma.prospect.create({
        data: {
          company,
          phone: phone || null,
          email: email || null,
          address: colMap.address !== undefined ? cols[colMap.address] || null : null,
          city: colMap.city !== undefined ? cols[colMap.city] || null : null,
          postalCode: colMap.postalCode !== undefined ? cols[colMap.postalCode] || null : null,
          googleMapsUrl: colMap.googleMapsUrl !== undefined ? cols[colMap.googleMapsUrl] || null : null,
          website: colMap.website !== undefined ? cols[colMap.website] || null : null,
          status: "a_contacter",
        },
      });
      count++;
    }

    revalidatePath("/admin/prospects");
    return { success: true, count };
  } catch (e) {
    console.error("Import error:", e);
    return { error: "Erreur lors de l'import du fichier CSV" };
  }
}

export async function updateProspectStatus(id: string, status: string) {
  try {
    await checkAdmin();
  } catch {
    return { error: "Acces non autorise" };
  }

  const validStatuses = [
    "a_contacter",
    "appele",
    "interesse",
    "compte_cree",
    "pas_interesse",
  ];
  if (!validStatuses.includes(status)) {
    return { error: "Statut invalide" };
  }

  await prisma.prospect.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/prospects");
  return { success: true };
}

export async function updateProspectNotes(id: string, notes: string) {
  try {
    await checkAdmin();
  } catch {
    return { error: "Acces non autorise" };
  }

  await prisma.prospect.update({
    where: { id },
    data: { notes },
  });

  revalidatePath("/admin/prospects");
  return { success: true };
}

export async function deleteProspect(id: string) {
  try {
    await checkAdmin();
  } catch {
    return { error: "Acces non autorise" };
  }

  await prisma.prospect.delete({
    where: { id },
  });

  revalidatePath("/admin/prospects");
  return { success: true };
}
