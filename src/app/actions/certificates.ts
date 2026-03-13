"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateNumber } from "@/lib/utils";
import { z } from "zod";

const ANOMALY_KEYS = [
  "anomaly_distance_plancher",
  "anomaly_distance_toiture",
  "anomaly_etancheite",
  "anomaly_coudes",
  "anomaly_souche",
  "anomaly_section_horizontale",
  "anomaly_plaque",
  "anomaly_bistre",
  "anomaly_autre",
] as const;

const certificateSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  clientQuality: z.enum(["proprietaire", "locataire", "syndic"], {
    message: "Qualité du client requise",
  }),
  date: z.string().min(1, "Date requise"),
  chimneyType: z.string().min(1, "Type d'appareil requis"),
  chimneyLocation: z.string().optional(),
  fuelType: z.string().optional(),
  applianceBrand: z.string().optional(),
  applianceModel: z.string().optional(),
  method: z.enum(["mecanique_haut", "mecanique_bas", "chimique", "mixte"], {
    message: "Méthode requise",
  }),
  conduitType: z.string().optional(),
  conduitDiameter: z.string().optional(),
  conduitLength: z.string().optional(),
  condition: z.enum(["bon_etat", "a_surveiller", "dangereux"], {
    message: "État requis",
  }),
  vacuumTest: z.boolean(),
  observations: z.string().optional(),
  recommendations: z.string().optional(),
  periodicity: z.enum(["annuel", "semestriel"], {
    message: "Périodicité requise",
  }),
  nextVisit: z.string().optional(),
  proSignature: z.string().optional(),
  clientSignature: z.string().optional(),
});

export async function createCertificate(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Collect anomalies from individual checkboxes
  const anomalies: string[] = [];
  for (const key of ANOMALY_KEYS) {
    if (formData.get(key) === "on") {
      anomalies.push(key);
    }
  }

  const raw = {
    clientId: formData.get("clientId") as string,
    clientQuality: formData.get("clientQuality") as string,
    date: formData.get("date") as string,
    chimneyType: formData.get("chimneyType") as string,
    chimneyLocation: formData.get("chimneyLocation") as string,
    fuelType: formData.get("fuelType") as string,
    applianceBrand: formData.get("applianceBrand") as string,
    applianceModel: formData.get("applianceModel") as string,
    method: formData.get("method") as string,
    conduitType: formData.get("conduitType") as string,
    conduitDiameter: formData.get("conduitDiameter") as string,
    conduitLength: formData.get("conduitLength") as string,
    condition: formData.get("condition") as string,
    vacuumTest: formData.get("vacuumTest") === "on",
    observations: formData.get("observations") as string,
    recommendations: formData.get("recommendations") as string,
    periodicity: formData.get("periodicity") as string,
    nextVisit: formData.get("nextVisit") as string,
    proSignature: formData.get("proSignature") as string,
    clientSignature: formData.get("clientSignature") as string,
  };

  const parsed = certificateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Verify client belongs to user
  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, userId: session.userId },
  });
  if (!client) {
    return { error: "Client introuvable" };
  }

  // Generate certificate number
  const count = await prisma.certificate.count({
    where: { userId: session.userId },
  });
  const number = generateNumber("CERT", count);

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      number,
      date: new Date(parsed.data.date),
      clientQuality: parsed.data.clientQuality,
      chimneyType: parsed.data.chimneyType,
      chimneyLocation: parsed.data.chimneyLocation || null,
      fuelType: parsed.data.fuelType || null,
      applianceBrand: parsed.data.applianceBrand || null,
      applianceModel: parsed.data.applianceModel || null,
      method: parsed.data.method,
      conduitType: parsed.data.conduitType || null,
      conduitDiameter: parsed.data.conduitDiameter || null,
      conduitLength: parsed.data.conduitLength || null,
      condition: parsed.data.condition,
      vacuumTest: parsed.data.vacuumTest,
      anomalies: anomalies.length > 0 ? anomalies : undefined,
      observations: parsed.data.observations || null,
      recommendations: parsed.data.recommendations || null,
      periodicity: parsed.data.periodicity,
      nextVisit: parsed.data.nextVisit ? new Date(parsed.data.nextVisit) : null,
      proSignature: parsed.data.proSignature || null,
      clientSignature: parsed.data.clientSignature || null,
      clientId: parsed.data.clientId,
      userId: session.userId,
    },
  });

  // Update client's lastVisit
  await prisma.client.update({
    where: { id: parsed.data.clientId },
    data: { lastVisit: new Date(parsed.data.date) },
  });

  redirect(`/certificates/${certificate.id}`);
}

export async function deleteCertificate(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.certificate.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return { error: "Certificat introuvable" };
  }

  await prisma.certificate.delete({ where: { id } });

  redirect("/certificates");
}
