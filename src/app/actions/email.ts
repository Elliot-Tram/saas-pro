"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function sendCertificateByEmail(
  certificateId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Non autorisé" };
  }

  const certificate = await prisma.certificate.findFirst({
    where: { id: certificateId, teamId: session.teamId },
    include: { client: true },
  });

  if (!certificate) {
    return { error: "Certificat introuvable" };
  }

  if (!certificate.client.email) {
    return { error: "Ce client n'a pas d'adresse email" };
  }

  // Fetch the PDF from the internal API route
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pdfResponse = await fetch(`${appUrl}/api/certificates/${certificateId}/pdf`, {
    headers: {
      Cookie: `token=${await getTokenFromCookies()}`,
    },
  });

  if (!pdfResponse.ok) {
    return { error: "Impossible de générer le PDF" };
  }

  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
  const clientName = `${certificate.client.firstName} ${certificate.client.lastName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #3366DE; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Certificat de ramonage</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour ${clientName},</p>
        <p>Veuillez trouver ci-joint votre certificat de ramonage n°<strong>${certificate.number}</strong>.</p>
        <p>Ce document atteste de l'intervention réalisée et doit être conservé pendant une durée minimale de 2 ans. Il peut vous être demandé par votre assurance.</p>
        <p>Pour toute question, n'hésitez pas à nous contacter.</p>
        <p style="margin-top: 30px;">Cordialement,<br/><strong>${session.name}</strong></p>
      </div>
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  `;

  const sent = await sendEmail({
    to: certificate.client.email,
    subject: `Certificat de ramonage n°${certificate.number}`,
    html,
    attachments: [
      {
        filename: `certificat-${certificate.number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  if (!sent) {
    return { error: "Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP." };
  }

  revalidatePath(`/certificates/${certificateId}`);
  return { success: true };
}

export async function sendInvoiceByEmail(
  invoiceId: string
): Promise<{ success?: boolean; error?: string }> {
  const session = await getSession();
  if (!session) {
    return { error: "Non autorisé" };
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, teamId: session.teamId },
    include: { client: true },
  });

  if (!invoice) {
    return { error: "Facture introuvable" };
  }

  if (!invoice.client.email) {
    return { error: "Ce client n'a pas d'adresse email" };
  }

  // Fetch the PDF from the internal API route
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const pdfResponse = await fetch(`${appUrl}/api/invoices/${invoiceId}/pdf`, {
    headers: {
      Cookie: `token=${await getTokenFromCookies()}`,
    },
  });

  if (!pdfResponse.ok) {
    return { error: "Impossible de générer le PDF" };
  }

  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
  const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;

  const formattedTotal = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(invoice.total);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #3366DE; padding: 20px 30px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Facture</h1>
      </div>
      <div style="padding: 30px; background-color: #f9f9f9; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Bonjour ${clientName},</p>
        <p>Veuillez trouver ci-joint la facture n°<strong>${invoice.number}</strong> d'un montant de <strong>${formattedTotal}</strong>.</p>
        ${invoice.dueDate ? `<p>Date d'échéance : <strong>${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(invoice.dueDate))}</strong></p>` : ""}
        <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
        <p style="margin-top: 30px;">Cordialement,<br/><strong>${session.name}</strong></p>
      </div>
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 15px;">
        Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
      </p>
    </div>
  `;

  const sent = await sendEmail({
    to: invoice.client.email,
    subject: `Facture n°${invoice.number}`,
    html,
    attachments: [
      {
        filename: `facture-${invoice.number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  if (!sent) {
    return { error: "Erreur lors de l'envoi de l'email. Vérifiez la configuration SMTP." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true };
}

async function getTokenFromCookies(): Promise<string> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value || "";
}
