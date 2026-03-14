"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function completeOnboarding(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Non authentifie" };

  const company = formData.get("company") as string;
  if (!company) {
    return { error: "La raison sociale est requise" };
  }

  const data = {
    company,
    siret: (formData.get("siret") as string) || null,
    phone: (formData.get("phone") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    postalCode: (formData.get("postalCode") as string) || null,
    logo: (formData.get("logo") as string) || null,
    qualification: (formData.get("qualification") as string) || null,
    insuranceNumber: (formData.get("insuranceNumber") as string) || null,
    insurerName: (formData.get("insurerName") as string) || null,
    googleReviewLink: (formData.get("googleReviewLink") as string) || null,
  };

  await prisma.user.update({
    where: { id: session.userId },
    data,
  });

  // If a sector name was provided, save it as the first client placeholder sector
  // The sector is stored on clients, so we just note it for later use
  // No action needed here since sectors are per-client in this schema

  redirect("/");
}
