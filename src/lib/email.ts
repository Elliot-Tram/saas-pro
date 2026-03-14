import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
}) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured, email not sent");
    return false;
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || "noreply@bistry.fr";
    const fromName = process.env.EMAIL_FROM_NAME || "Bistry";

    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
