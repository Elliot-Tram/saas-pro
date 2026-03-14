"use server";

import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword, createToken, setSession, clearSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "6 caractères minimum"),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function register(_prevState: unknown, formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    company: formData.get("company") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email" };
  }

  const hashedPassword = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      company: parsed.data.company || null,
    },
  });

  const token = await createToken({ userId: user.id, email: user.email, name: user.name });
  await setSession(token);
  redirect("/onboarding");
}

export async function login(_prevState: unknown, formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const valid = await verifyPassword(parsed.data.password, user.password);
  if (!valid) {
    return { error: "Email ou mot de passe incorrect" };
  }

  const token = await createToken({ userId: user.id, email: user.email, name: user.name });
  await setSession(token);
  redirect("/");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
