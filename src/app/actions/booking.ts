"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const bookingSchema = z.object({
  firstName: z.string().min(1, "Le prenom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(1, "Le telephone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  chimneyType: z.string().optional(),
  message: z.string().optional(),
  teamId: z.string().min(1, "Equipe requise"),
});

export async function submitBookingRequest(
  _prevState: unknown,
  formData: FormData
) {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    postalCode: formData.get("postalCode") as string,
    chimneyType: formData.get("chimneyType") as string,
    message: formData.get("message") as string,
    teamId: formData.get("teamId") as string,
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, phone, email, address, city, postalCode, chimneyType, message, teamId } = parsed.data;

  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, company: true },
  });
  if (!team) {
    return { error: "Entreprise introuvable" };
  }

  // Find the first admin user of the team to assign the appointment
  const adminUser = await prisma.user.findFirst({
    where: { teamId, role: "admin" },
    select: { id: true },
  });
  if (!adminUser) {
    return { error: "Aucun responsable disponible" };
  }

  // Create the client
  const noteText = message
    ? `Demande de devis en ligne: ${message}`
    : "Demande de devis en ligne";

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      phone: phone || null,
      email: email || null,
      address,
      city: city || null,
      postalCode: postalCode || null,
      chimneyType: chimneyType || null,
      notes: noteText,
      teamId,
    },
  });

  // Create appointment for tomorrow at 9:00 as a placeholder
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      title: `Demande de devis — ${firstName} ${lastName}`,
      description: message || null,
      date: tomorrow,
      endDate: tomorrowEnd,
      status: "scheduled",
      clientId: client.id,
      assignedToId: adminUser.id,
      teamId,
    },
  });

  return { success: true, companyName: team.company || "L'entreprise" };
}
