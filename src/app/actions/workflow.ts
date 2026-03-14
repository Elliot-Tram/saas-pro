"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function completeIntervention(appointmentId: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Verify the appointment exists and belongs to this user
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, teamId: session.teamId },
  });
  if (!appointment) {
    return { error: "Rendez-vous introuvable" };
  }

  // Mark the appointment as completed
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "completed" },
  });

  revalidatePath("/");
  revalidatePath("/calendar");

  // Redirect to certificate creation pre-filled with the client's data
  redirect(
    `/certificates/new?clientId=${appointment.clientId}&fromWorkflow=true`
  );
}
