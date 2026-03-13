"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { generateNumber } from "@/lib/utils";
import { z } from "zod";

const contractSchema = z.object({
  clientId: z.string().min(1, "Client requis"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  amount: z.number().positive("Le montant doit être positif"),
  visits: z.number().int().min(1, "Au moins 1 visite requise"),
  description: z.string().optional(),
  autoRenew: z.boolean(),
});

export async function createContract(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = {
    clientId: formData.get("clientId") as string,
    startDate: formData.get("startDate") as string,
    endDate: formData.get("endDate") as string,
    amount: parseFloat(formData.get("amount") as string),
    visits: parseInt(formData.get("visits") as string, 10),
    description: formData.get("description") as string,
    autoRenew: formData.get("autoRenew") === "on",
  };

  const parsed = contractSchema.safeParse(raw);
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

  // Generate contract number
  const count = await prisma.contract.count({
    where: { userId: session.userId },
  });
  const number = generateNumber("CTR", count);

  // Create contract
  await prisma.contract.create({
    data: {
      number,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      amount: parsed.data.amount,
      visits: parsed.data.visits,
      description: parsed.data.description || null,
      autoRenew: parsed.data.autoRenew,
      clientId: parsed.data.clientId,
      userId: session.userId,
    },
  });

  redirect("/contracts");
}

export async function updateContractStatus(id: string, status: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.contract.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return { error: "Contrat introuvable" };
  }

  await prisma.contract.update({
    where: { id },
    data: { status },
  });

  redirect("/contracts");
}

export async function deleteContract(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.contract.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return { error: "Contrat introuvable" };
  }

  await prisma.contract.delete({ where: { id } });

  redirect("/contracts");
}
