"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Non authentifié" };

  const userName = formData.get("userName") as string;
  const userEmail = formData.get("userEmail") as string;

  const teamData = {
    phone: (formData.get("phone") as string) || null,
    company: (formData.get("company") as string) || null,
    siret: (formData.get("siret") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    postalCode: (formData.get("postalCode") as string) || null,
    logo: (formData.get("logo") as string) || null,
    insuranceNumber: (formData.get("insuranceNumber") as string) || null,
    insurerName: (formData.get("insurerName") as string) || null,
    qualification: (formData.get("qualification") as string) || null,
    googleReviewLink: (formData.get("googleReviewLink") as string) || null,
  };

  if (!userName || !userEmail) {
    return { error: "Nom et email sont requis" };
  }

  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: userEmail } });
  if (existing && existing.id !== session.userId) {
    return { error: "Cet email est déjà utilisé" };
  }

  // Update user fields (name, email)
  await prisma.user.update({
    where: { id: session.userId },
    data: { name: userName, email: userEmail },
  });

  // Update team fields (company info)
  await prisma.team.update({
    where: { id: session.teamId },
    data: teamData,
  });

  return { success: true };
}
