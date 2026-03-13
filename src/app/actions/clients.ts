"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const clientSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, "Adresse requise"),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  chimneyType: z.string().optional(),
  fuelType: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    postalCode: formData.get("postalCode") as string,
    chimneyType: formData.get("chimneyType") as string,
    fuelType: formData.get("fuelType") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.client.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address,
      city: parsed.data.city || null,
      postalCode: parsed.data.postalCode || null,
      chimneyType: parsed.data.chimneyType || null,
      fuelType: parsed.data.fuelType || null,
      notes: parsed.data.notes || null,
      userId: session.userId,
    },
  });

  redirect("/clients");
}

export async function updateClient(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Identifiant client manquant" };
  }

  const existing = await prisma.client.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    return { error: "Client introuvable" };
  }

  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    postalCode: formData.get("postalCode") as string,
    chimneyType: formData.get("chimneyType") as string,
    fuelType: formData.get("fuelType") as string,
    notes: formData.get("notes") as string,
  };

  const parsed = clientSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.client.update({
    where: { id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      address: parsed.data.address,
      city: parsed.data.city || null,
      postalCode: parsed.data.postalCode || null,
      chimneyType: parsed.data.chimneyType || null,
      fuelType: parsed.data.fuelType || null,
      notes: parsed.data.notes || null,
    },
  });

  redirect("/clients");
}

export async function deleteClient(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const existing = await prisma.client.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) {
    redirect("/clients");
  }

  await prisma.client.delete({ where: { id } });

  redirect("/clients");
}
