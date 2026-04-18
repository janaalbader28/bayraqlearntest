/**
 * Email system using Gmail SMTP (App Password).
 *
 * Required environment variables:
 *   EMAIL_USER   bayraqlearn.noreply@gmail.com
 *   EMAIL_PASS   Gmail App Password (no spaces)
 *   EMAIL_FROM   "BayraqLearn (No Reply) <bayraqlearn.noreply@gmail.com>"
 *
 * If EMAIL_USER is not set, all sends are silently skipped.
 */

import nodemailer from "nodemailer";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://bayraqlearn.com";
const FROM =
  process.env.EMAIL_FROM ??
  "BayraqLearn (No Reply) <bayraqlearn.noreply@gmail.com>";

function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // STARTTLS
    auth: { user, pass },
  });
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────

function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1d4ed8,#4f46e5);padding:36px 36px 28px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.7);text-transform:uppercase;">BayraqLearn Academy</p>
      <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">${title}</h1>
    </div>
    <!-- Body -->
    <div style="padding:36px;">
      ${body}
    </div>
    <!-- Footer -->
    <div style="padding:20px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
        © 2026 BayraqLearn Academy &nbsp;·&nbsp; This is an automated message, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Button helper ─────────────────────────────────────────────────────────────

function btn(href: string, label: string, color = "#1d4ed8"): string {
  return `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${label}</a>`;
}

// ─── WhatsApp section ─────────────────────────────────────────────────────────

function whatsappSection(link: string | null | undefined): string {
  if (!link) return "";
  return `
    <div style="margin-top:20px;padding:16px 20px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
      <p style="margin:0 0 10px;font-weight:700;color:#15803d;font-size:14px;">💬 Join Our WhatsApp Group</p>
      ${btn(link, "Join WhatsApp Group", "#16a34a")}
    </div>`;
}

// ─── Schedule section ─────────────────────────────────────────────────────────

function scheduleSection(scheduleJson: string | null | undefined): string {
  if (!scheduleJson) return "";
  try {
    const parsed = JSON.parse(scheduleJson) as {
      sessions?: Array<{ day?: string; start_time?: string; end_time?: string }>;
      session_count?: number;
    };
    const sessions = parsed.sessions ?? [];
    if (sessions.length === 0) return "";

    const rows = sessions
      .map(
        (s) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${s.day ?? "—"}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${s.start_time ?? ""} – ${s.end_time ?? ""}</td>
          </tr>`
      )
      .join("");

    const totalLine = parsed.session_count
      ? `<p style="margin:12px 0 0;font-size:13px;color:#64748b;">Total sessions: <strong>${parsed.session_count}</strong></p>`
      : "";

    return `
      <div style="margin-top:20px;">
        <p style="margin:0 0 10px;font-weight:700;color:#1e293b;font-size:14px;">📅 Weekly Schedule</p>
        <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#e2e8f0;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;">Day</th>
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;">Time</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        ${totalLine}
      </div>`;
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// A. Welcome Email
// ═══════════════════════════════════════════════════════════════════════════════

export type WelcomeEmailData = {
  to: string;
  username: string;
};

export function buildWelcomeEmail(data: WelcomeEmailData): string {
  return emailLayout(
    "Welcome to BayraqLearn! 🎉",
    `<p style="color:#334155;font-size:15px;">Hi <strong>${data.username}</strong>,</p>
    <p style="color:#475569;line-height:1.7;">
      We're excited to have you on board! BayraqLearn is your home for high-quality tech courses
      in Cybersecurity, Cloud, AI, Programming, and more — all designed to help you grow at your own pace.
    </p>
    <div style="background:#f1f5f9;border-radius:12px;padding:20px;margin:24px 0;">
      <p style="margin:0 0 8px;font-weight:700;color:#1e293b;">What's next?</p>
      <ul style="margin:0;padding-left:20px;color:#475569;line-height:2;">
        <li>Browse our course catalog</li>
        <li>Enroll in a course that fits your goals</li>
        <li>Earn certificates and badges as you progress</li>
      </ul>
    </div>
    ${btn(`${BASE_URL}/courses`, "Browse Courses")}
    <p style="margin-top:28px;font-size:13px;color:#94a3b8;">
      Questions? Contact us at <a href="mailto:bayraqlearn.noreply@gmail.com" style="color:#1d4ed8;">bayraqlearn.noreply@gmail.com</a>
    </p>`
  );
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;
  await transport.sendMail({
    from: FROM,
    to: data.to,
    subject: "Welcome to Bayraq Learn",
    html: buildWelcomeEmail(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// B. Purchase / Enrollment Email
// ═══════════════════════════════════════════════════════════════════════════════

export type PurchaseEmailData = {
  to: string;
  username: string;
  courseTitle: string;
  courseDescription?: string | null;
  category?: string | null;
  isLive: boolean;
  durationHours: number;
  price: number;
  zoomLink?: string | null;
  scheduleJson?: string | null;
  whatsappLink?: string | null;
};

export function buildPurchaseEmail(data: PurchaseEmailData): string {
  const priceText = data.price === 0 ? "Free" : `${data.price.toLocaleString()} SAR`;
  const typeLabel = data.isLive ? "Live Course (Zoom)" : "E-Learning (Self-paced)";
  const typeColor = data.isLive ? "#0f766e" : "#1d4ed8";
  const typeBg = data.isLive ? "#f0fdfa" : "#eff6ff";
  const typeBorder = data.isLive ? "#99f6e4" : "#bfdbfe";

  const zoomSection = data.zoomLink
    ? `<div style="margin-top:20px;padding:16px 20px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
        <p style="margin:0 0 10px;font-weight:700;color:#1e40af;font-size:14px;">🎥 Zoom Link</p>
        ${btn(data.zoomLink, "Join via Zoom", "#1d4ed8")}
       </div>`
    : "";

  const descSection = data.courseDescription
    ? `<p style="color:#475569;font-size:14px;line-height:1.7;margin:12px 0 0;">${data.courseDescription}</p>`
    : "";

  return emailLayout(
    `You're Enrolled in ${data.courseTitle} 🎓`,
    `<p style="color:#334155;font-size:15px;">Hi <strong>${data.username}</strong>,</p>
    <p style="color:#475569;">Your enrollment is confirmed. Here are your course details:</p>

    <div style="background:#f8fafc;border-radius:14px;padding:22px;margin:20px 0;border:1px solid #e2e8f0;">
      <span style="display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;background:${typeBg};color:${typeColor};border:1px solid ${typeBorder};margin-bottom:12px;">${typeLabel}</span>
      <h2 style="margin:0 0 4px;color:#0f172a;font-size:20px;">${data.courseTitle}</h2>
      ${data.category ? `<p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1px;color:#94a3b8;text-transform:uppercase;">${data.category}</p>` : ""}
      ${descSection}
      <div style="margin-top:16px;display:flex;gap:20px;flex-wrap:wrap;">
        <span style="font-size:13px;color:#64748b;">⏱ Duration: <strong>${data.durationHours}h</strong></span>
        <span style="font-size:13px;color:#64748b;">💰 Price: <strong>${priceText}</strong></span>
      </div>
    </div>

    ${zoomSection}
    ${scheduleSection(data.scheduleJson)}
    ${whatsappSection(data.whatsappLink)}

    <div style="margin-top:28px;">
      ${btn(`${BASE_URL}/dashboard/courses`, "Go to My Courses")}
    </div>
    <p style="margin-top:28px;font-size:12px;color:#94a3b8;">
      If you did not make this enrollment, please contact us immediately.
    </p>`
  );
}

export async function sendPurchaseEmail(data: PurchaseEmailData): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;
  await transport.sendMail({
    from: FROM,
    to: data.to,
    subject: `You're Enrolled in ${data.courseTitle}`,
    html: buildPurchaseEmail(data),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// C. Reminder Email (Live Courses)
// ═══════════════════════════════════════════════════════════════════════════════

export type ReminderEmailData = {
  to: string;
  username: string;
  courseTitle: string;
  sessionDay: string;
  sessionStart: string;
  sessionEnd: string;
  zoomLink: string;
  hoursBeforeSession: number;
  whatsappLink?: string | null;
};

export function buildReminderEmail(data: ReminderEmailData): string {
  return emailLayout(
    `Session Reminder: ${data.courseTitle} ⏰`,
    `<p style="color:#334155;font-size:15px;">Hi <strong>${data.username}</strong>,</p>
    <p style="color:#475569;line-height:1.7;">
      Your upcoming session for <strong>${data.courseTitle}</strong> is starting in
      <strong>${data.hoursBeforeSession} hour${data.hoursBeforeSession !== 1 ? "s" : ""}</strong>.
      Don't miss it!
    </p>

    <div style="background:#fefce8;border:1px solid #fef08a;border-radius:14px;padding:22px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;color:#a16207;text-transform:uppercase;">Upcoming Session</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#0f172a;">${data.sessionDay}</p>
      <p style="margin:6px 0 0;font-size:15px;color:#334155;">${data.sessionStart} – ${data.sessionEnd}</p>
    </div>

    <div style="margin-top:16px;">
      ${btn(data.zoomLink, "Join Session on Zoom", "#0f766e")}
    </div>
    ${whatsappSection(data.whatsappLink)}
    <p style="margin-top:28px;font-size:12px;color:#94a3b8;">BayraqLearn Academy · See you there!</p>`
  );
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<void> {
  const transport = getTransporter();
  if (!transport) return;
  await transport.sendMail({
    from: FROM,
    to: data.to,
    subject: `Reminder: ${data.courseTitle} — ${data.sessionDay} at ${data.sessionStart}`,
    html: buildReminderEmail(data),
  });
}
