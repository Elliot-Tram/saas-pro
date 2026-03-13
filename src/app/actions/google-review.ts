"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function sendGoogleReviewRequest(
  clientId: string,
  certificateNumber?: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Non autoris\u00e9" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      googleReviewLink: true,
      company: true,
      name: true,
    },
  });

  if (!user) {
    return { error: "Utilisateur introuvable" };
  }

  if (!user.googleReviewLink) {
    return { error: "Lien Google avis non configur\u00e9. Ajoutez-le dans Param\u00e8tres." };
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.userId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!client) {
    return { error: "Client introuvable" };
  }

  if (!client.email) {
    return { error: "Ce client n\u2019a pas d\u2019adresse email" };
  }

  const companyName = user.company || user.name;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #3366DE; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">${companyName}</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour ${client.firstName},</p>
        <p>Merci de nous avoir fait confiance pour votre ramonage.</p>
        <p>Votre satisfaction est notre priorit\u00e9. Si vous \u00eates satisfait(e) de notre intervention, nous serions ravis que vous partagiez votre exp\u00e9rience.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${user.googleReviewLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #3366DE; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
            Laisser un avis Google \u2605\u2605\u2605\u2605\u2605
          </a>
        </div>
        <p>Merci et \u00e0 bient\u00f4t !</p>
        <p style="margin-top: 20px;"><strong>${companyName}</strong></p>
      </div>
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
        Cet email a \u00e9t\u00e9 envoy\u00e9 automatiquement. Merci de ne pas y r\u00e9pondre directement.
      </p>
    </div>
  `;

  const subject = `${companyName} \u2014 Votre avis compte !`;

  const sent = await sendEmail({
    to: client.email,
    subject,
    html,
  });

  if (!sent) {
    return { error: "Erreur lors de l\u2019envoi de l\u2019email. V\u00e9rifiez la configuration SMTP." };
  }

  return { success: true };
}
