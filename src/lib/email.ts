import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions): Promise<boolean> {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn("[Email] SMTP non configuré — email non envoyé. Vérifiez les variables SMTP_HOST, SMTP_USER, SMTP_PASS.");
    return false;
  }

  const from = process.env.SMTP_FROM || "noreply@saas-pro.fr";

  try {
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });
    return true;
  } catch (error) {
    console.error("[Email] Erreur lors de l'envoi :", error);
    return false;
  }
}
