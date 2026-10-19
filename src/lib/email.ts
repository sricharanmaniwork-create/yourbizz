/**
 * Email sending utility (Resend in production, console.log stub in sandbox).
 *
 * In production:
 *   - Set RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_REPLY_TO in Vercel env.
 *   - Resend SDK is imported lazily so it doesn't break sandbox builds.
 */

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
};

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string; error?: string }> {
  const from = payload.from || process.env.RESEND_FROM_EMAIL || "noreply@yourbizz.app";
  const replyTo = payload.replyTo || process.env.RESEND_REPLY_TO || "support@yourbizz.app";

  // Sandbox fallback
  if (!process.env.RESEND_API_KEY) {
    console.log("[email stub] to:", payload.to, "subject:", payload.subject);
    console.log("[email stub] body (text):", payload.text?.slice(0, 200));
    return { ok: true, id: "stub-" + Date.now() };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

export function welcomeEmailHtml(name: string | null, verifyUrl?: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #7c3aed; font-size: 28px; margin: 0;">Welcome to YourBizz</h1>
      </div>
      <p style="font-size: 16px; color: #18181b; line-height: 1.6;">
        Hi ${name || "there"},
      </p>
      <p style="font-size: 16px; color: #18181b; line-height: 1.6;">
        Your YourBizz account is ready. You can now build forms, accept bookings,
        and manage customer relationships — all from one place.
      </p>
      ${
        verifyUrl
          ? `<div style="margin: 32px 0; text-align: center;">
              <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Verify your email</a>
            </div>`
          : ""
      }
      <p style="font-size: 14px; color: #71717a; margin-top: 40px;">
        — The YourBizz Team
      </p>
    </div>
  `;
}

export function submissionAlertHtml(formName: string, submissionUrl: string, summary: { field: string; value: string }[]): string {
  const rows = summary.map((r) => `<tr><td style="padding: 8px 0; color: #71717a; width: 40%;">${r.field}</td><td style="padding: 8px 0; color: #18181b; font-weight: 500;">${r.value}</td></tr>`).join("");
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #7c3aed; font-size: 22px; margin: 0 0 8px;">New submission on ${formName}</h1>
      <p style="color: #71717a; font-size: 14px; margin: 0 0 24px;">A respondent just submitted your form.</p>
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">${rows}</table>
      <div style="margin-top: 32px; text-align: center;">
        <a href="${submissionUrl}" style="display: inline-block; padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View full submission</a>
      </div>
    </div>
  `;
}
