"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const appointmentSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  duration: z.coerce.number().min(15, "Durée invalide"),
  clientId: z.string().min(1, "Le client est requis"),
});

export async function createAppointment(_prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    date: formData.get("date") as string,
    time: formData.get("time") as string,
    duration: formData.get("duration") as string,
    clientId: formData.get("clientId") as string,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { title, description, date, time, duration, clientId } = parsed.data;

  // Build start date from date + time
  const startDate = new Date(`${date}T${time}:00`);
  if (isNaN(startDate.getTime())) {
    return { error: "Date ou heure invalide" };
  }

  // Compute end date from start + duration in minutes
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

  // Verify the client belongs to this user
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.userId },
  });
  if (!client) {
    return { error: "Client introuvable" };
  }

  await prisma.appointment.create({
    data: {
      title,
      description: description || null,
      date: startDate,
      endDate,
      status: "scheduled",
      clientId,
      userId: session.userId,
    },
  });

  revalidatePath("/calendar");
  redirect("/calendar");
}

export async function updateAppointmentStatus(id: string, status: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const validStatuses = ["scheduled", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return { error: "Statut invalide" };
  }

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: session.userId },
  });
  if (!appointment) {
    return { error: "Rendez-vous introuvable" };
  }

  await prisma.appointment.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: session.userId },
  });
  if (!appointment) {
    return { error: "Rendez-vous introuvable" };
  }

  await prisma.appointment.delete({ where: { id } });

  revalidatePath("/calendar");
  redirect("/calendar");
}
