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

    // Skip header row
    const dataRows = rows.slice(1);
    let count = 0;

    for (const row of dataRows) {
      // Support both ; and , separators
      const separator = row.includes(";") ? ";" : ",";
      const cols = row.split(separator).map((col) => col.trim());

      const company = cols[0];
      if (!company) continue;

      await prisma.prospect.create({
        data: {
          company,
          phone: cols[1] || null,
          email: cols[2] || null,
          address: cols[3] || null,
          city: cols[4] || null,
          postalCode: cols[5] || null,
          googleMapsUrl: cols[6] || null,
          website: cols[7] || null,
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
