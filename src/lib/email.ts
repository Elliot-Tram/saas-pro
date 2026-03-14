const BREVO_API_KEY = process.env.BREVO_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@bistry.fr";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Bistry";

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
  if (!BREVO_API_KEY) {
    console.warn("BREVO_API_KEY not configured, email not sent");
    return false;
  }

  try {
    const body: Record<string, unknown> = {
      sender: { name: EMAIL_FROM_NAME, email: EMAIL_FROM },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    if (attachments?.length) {
      body.attachment = attachments.map((a) => ({
        name: a.filename,
        content: a.content.toString("base64"),
      }));
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Brevo API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}
