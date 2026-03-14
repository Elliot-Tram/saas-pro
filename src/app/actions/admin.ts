"use server";

import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function createProspectAccount(
  _prevState: unknown,
  formData: FormData
) {
  const session = await getSession();
  if (!session || session.email !== process.env.ADMIN_EMAIL) {
    return { error: "Accès non autorisé" };
  }

  const company = formData.get("company") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const siret = formData.get("siret") as string;

  if (!company || !email || !password) {
    return { error: "Nom de l'entreprise, email et mot de passe sont requis" };
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email" };
  }

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const team = await tx.team.create({
      data: {
        name: company,
        company,
        phone: phone || null,
        city: city || null,
        siret: siret || null,
      },
    });

    await tx.user.create({
      data: {
        name: company,
        email,
        password: hashedPassword,
        role: "admin",
        teamId: team.id,
      },
    });
  });

  return {
    success: true,
    email,
    password,
    company,
  };
}
