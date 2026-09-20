/**
 * Transactional email.
 *
 * Uses Resend when RESEND_API_KEY is present; otherwise it logs the message so
 * the platform stays fully functional in development and on a fresh deploy.
 */

type MailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, replyTo }: MailInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "RootSym <onboarding@resend.dev>";

  if (!key) {
    console.info(`[mail:dev] → ${to} :: ${subject}\n${html.replace(/<[^>]+>/g, " ").slice(0, 400)}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    });
    if (!res.ok) {
      console.error("[mail] Resend rejected the message", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mail] failed to send", error);
    return false;
  }
}

const SHELL = (body: string) => `
<div style="margin:0;padding:32px 0;background:#f4efe1;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fffdf7;border:1px solid #e4d9bd;border-radius:18px;overflow:hidden;">
    <div style="background:#0b2a36;padding:26px 32px;">
      <div style="color:#f6efdc;font-size:24px;letter-spacing:.06em;font-weight:700;">RootSym</div>
      <div style="color:#c9a227;font-size:11px;letter-spacing:.22em;text-transform:uppercase;margin-top:4px;">Root Cause Analysis &amp; Systematic Actions</div>
    </div>
    <div style="padding:32px;color:#16323d;font-size:15px;line-height:1.65;">${body}</div>
    <div style="padding:18px 32px;background:#f4efe1;color:#5d6f77;font-size:12px;">
      RootSym — by Rand Saleh · Amman, Jordan
    </div>
  </div>
</div>`;

export function accessEmail(opts: {
  name: string;
  courseTitle: string;
  reference: string;
  accessUrl: string;
  sessionLine?: string;
}) {
  return SHELL(`
    <p style="margin:0 0 14px;">Hello ${escapeHtml(opts.name)},</p>
    <p style="margin:0 0 14px;">Your seat on <strong>${escapeHtml(opts.courseTitle)}</strong> is confirmed. Booking reference <strong>${escapeHtml(opts.reference)}</strong>.</p>
    ${opts.sessionLine ? `<p style="margin:0 0 14px;">${escapeHtml(opts.sessionLine)}</p>` : ""}
    <p style="margin:0 0 20px;">Use the button below to open your personal joining page. <strong>It opens once</strong> — the Microsoft Teams link is revealed there and the page is then sealed, so keep the link you are shown.</p>
    <p style="margin:0 0 24px;">
      <a href="${opts.accessUrl}" style="display:inline-block;background:#c9a227;color:#0b2a36;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px;">Open my joining link</a>
    </p>
    <p style="margin:0;color:#5d6f77;font-size:13px;">If the page says it has already been opened, just reply to this email and we will issue a new one.</p>
  `);
}

export function bankTransferEmail(opts: {
  name: string;
  courseTitle: string;
  reference: string;
  amount: string;
  instructions: string;
}) {
  return SHELL(`
    <p style="margin:0 0 14px;">Hello ${escapeHtml(opts.name)},</p>
    <p style="margin:0 0 14px;">We have reserved your place on <strong>${escapeHtml(opts.courseTitle)}</strong> for 48 hours.</p>
    <p style="margin:0 0 14px;">Amount due: <strong>${escapeHtml(opts.amount)}</strong><br/>Reference: <strong>${escapeHtml(opts.reference)}</strong></p>
    <div style="background:#f4efe1;border-radius:12px;padding:16px;margin:0 0 16px;white-space:pre-line;">${escapeHtml(opts.instructions)}</div>
    <p style="margin:0;">Once the transfer lands we confirm your seat and email your single-use joining link.</p>
  `);
}

export function adminAlertEmail(opts: { title: string; lines: string[] }) {
  return SHELL(`
    <p style="margin:0 0 14px;font-weight:700;">${escapeHtml(opts.title)}</p>
    <ul style="margin:0;padding-left:18px;">
      ${opts.lines.map((l) => `<li style="margin:0 0 6px;">${escapeHtml(l)}</li>`).join("")}
    </ul>
  `);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
