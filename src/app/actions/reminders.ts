"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendAnnualReminder(
  clientId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Non autorisé" };
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.userId },
  });

  if (!client) {
    return { error: "Client introuvable" };
  }

  if (!client.email) {
    return { error: "Ce client n'a pas d'adresse email" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return { error: "Utilisateur introuvable" };
  }

  const clientName = `${client.firstName} ${client.lastName}`;
  const lastVisitFormatted = client.lastVisit
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(client.lastVisit))
    : "date inconnue";

  const companyName = user.company || user.name;
  const phone = user.phone || "notre numéro habituel";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #3366DE; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Rappel - Ramonage annuel</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour ${clientName},</p>
        <p>Il est temps de planifier votre ramonage annuel. Votre dernier ramonage date du <strong>${lastVisitFormatted}</strong>.</p>
        <p>Pour votre sécurité et conformément à la réglementation, nous vous recommandons de prendre rendez-vous rapidement.</p>
        <p>Contactez-nous au <strong>${phone}</strong> ou répondez à cet email.</p>
        <p style="margin-top: 30px;">Cordialement,<br/><strong>${companyName}</strong></p>
      </div>
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  `;

  const sent = await sendEmail({
    to: client.email,
    subject: `Rappel : ramonage annuel - ${companyName}`,
    html,
  });

  if (!sent) {
    return { error: "Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP." };
  }

  // Update nextReminder to 1 year from now
  const nextReminder = new Date();
  nextReminder.setFullYear(nextReminder.getFullYear() + 1);

  await prisma.client.update({
    where: { id: clientId },
    data: { nextReminder },
  });

  revalidatePath("/reminders");
  return { success: true };
}
