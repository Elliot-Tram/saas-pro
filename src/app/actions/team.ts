"use server";

import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function inviteMember(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Non authentifié" };
  if (session.role !== "admin") return { error: "Seuls les administrateurs peuvent inviter des membres" };

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !role) {
    return { error: "Tous les champs sont requis" };
  }

  if (!["admin", "member"].includes(role)) {
    return { error: "Rôle invalide" };
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Cet email est déjà utilisé" };
  }

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
  const hashedPassword = await hashPassword(tempPassword);

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      teamId: session.teamId,
    },
  });

  revalidatePath("/team");
  redirect("/team");
}

export async function removeMember(userId: string) {
  const session = await getSession();
  if (!session) return { error: "Non authentifié" };
  if (session.role !== "admin") return { error: "Seuls les administrateurs peuvent retirer des membres" };

  if (userId === session.userId) {
    return { error: "Vous ne pouvez pas vous retirer vous-même" };
  }

  // Verify the user belongs to the same team
  const member = await prisma.user.findUnique({ where: { id: userId } });
  if (!member || member.teamId !== session.teamId) {
    return { error: "Membre introuvable" };
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/team");
  return { success: true };
}
