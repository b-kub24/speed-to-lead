import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY!;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'leads@leadflash.io';

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(resendApiKey);
  }
  return resendClient;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  replyTo?: string;
}

export interface EmailResult {
  id: string;
}

/**
 * Send an email via Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const client = getResendClient();

  const { data, error } = await client.emails.send({
    from: fromEmail,
    to: params.to,
    subject: params.subject,
    html: params.htmlBody,
    text: params.textBody,
    reply_to: params.replyTo,
  });

  if (error) {
    throw new Error(`Resend email error: ${error.message}`);
  }

  return { id: data?.id || 'unknown' };
}

/**
 * Build a branded HTML email body for a lead follow-up
 */
export function buildFollowUpEmailHtml(params: {
  businessName: string;
  prospectName: string;
  emailBody: string;
  bookingLink?: string | null;
}): string {
  const bookingSection = params.bookingLink
    ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${params.bookingLink}"
           style="background-color:#f97316;color:#ffffff;padding:14px 28px;
                  text-decoration:none;border-radius:6px;font-weight:600;
                  font-size:16px;display:inline-block;">
          Book a Time With Us
        </a>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f9fafb;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background-color:#ffffff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <div style="border-bottom:3px solid #f97316;padding-bottom:16px;margin-bottom:24px;">
        <h2 style="margin:0;color:#1f2937;font-size:20px;">${params.businessName}</h2>
      </div>
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Hi ${params.prospectName || 'there'},
      </p>
      <div style="color:#374151;font-size:16px;line-height:1.6;white-space:pre-wrap;">
${params.emailBody}
      </div>
      ${bookingSection}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          Sent by ${params.businessName} via LeadFlash
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
