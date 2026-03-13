"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function sendPaymentReminder(
  invoiceId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Non autorisé" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId: session.userId },
    include: { client: true },
  });

  if (!invoice) {
    return { error: "Facture introuvable" };
  }

  if (invoice.status !== "sent") {
    return { error: "Seules les factures envoyées peuvent faire l'objet d'une relance" };
  }

  if (!invoice.client.email) {
    return { error: "Ce client n'a pas d'adresse email" };
  }

  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;
  const formattedTotal = formatCurrency(invoice.total);
  const formattedDate = formatDate(invoice.date);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #DC2626; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Rappel de paiement</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour ${clientName},</p>
        <p>Nous vous rappelons que la facture n°<strong>${invoice.number}</strong> d'un montant de <strong>${formattedTotal}</strong> datée du <strong>${formattedDate}</strong> reste en attente de paiement.</p>
        <p>Nous vous remercions de bien vouloir procéder au règlement dans les meilleurs délais.</p>
        <p style="margin-top: 30px;">Cordialement,<br/><strong>${session.name}</strong></p>
      </div>
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  `;

  const sent = await sendEmail({
    to: invoice.client.email,
    subject: `Rappel : Facture n°${invoice.number} en attente de paiement`,
    html,
  });

  if (!sent) {
    return { error: "Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP." };
  }

  return { success: true };
}
