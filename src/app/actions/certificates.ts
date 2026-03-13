"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateNumber } from "@/lib/utils";
import { z } from "zod";

const certificateSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  date: z.string().min(1, "Date requise"),
  chimneyType: z.string().min(1, "Type de cheminée requis"),
  chimneyLocation: z.string().optional(),
  fuelType: z.string().optional(),
  condition: z.enum(["bon_etat", "a_surveiller", "dangereux"], {
    message: "État requis",
  }),
  vacuumTest: z.boolean(),
  observations: z.string().optional(),
  nextVisit: z.string().optional(),
});

export async function createCertificate(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = {
    clientId: formData.get("clientId") as string,
    date: formData.get("date") as string,
    chimneyType: formData.get("chimneyType") as string,
    chimneyLocation: formData.get("chimneyLocation") as string,
    fuelType: formData.get("fuelType") as string,
    condition: formData.get("condition") as string,
    vacuumTest: formData.get("vacuumTest") === "on",
    observations: formData.get("observations") as string,
    nextVisit: formData.get("nextVisit") as string,
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
  await prisma.certificate.create({
    data: {
      number,
      date: new Date(parsed.data.date),
      chimneyType: parsed.data.chimneyType,
      chimneyLocation: parsed.data.chimneyLocation || null,
      fuelType: parsed.data.fuelType || null,
      condition: parsed.data.condition,
      vacuumTest: parsed.data.vacuumTest,
      observations: parsed.data.observations || null,
      nextVisit: parsed.data.nextVisit ? new Date(parsed.data.nextVisit) : null,
      clientId: parsed.data.clientId,
      userId: session.userId,
    },
  });

  // Update client's lastVisit
  await prisma.client.update({
    where: { id: parsed.data.clientId },
    data: { lastVisit: new Date(parsed.data.date) },
  });

  redirect("/certificates");
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
