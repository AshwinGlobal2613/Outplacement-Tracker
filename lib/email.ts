import type { Session } from "./types";

const FROM     = `"Global Management Consultants" <${process.env.SMTP_FROM || "team@global-dubai.com"}>`;
const BASE_URL = process.env.NEXTAUTH_URL || "https://outplacement-tracker-drab.vercel.app";
const YEAR     = new Date().getFullYear();

// ─── Core sender ─────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[email] RESEND_API_KEY not set — skipping"); return null; }
  const res  = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${JSON.stringify(body)}`);
  return (body as { id?: string }).id ?? null;
}

// ─── Global branded layout wrapper ───────────────────────────────────────────

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#0c0a1e;border-radius:12px 12px 0 0;padding:28px 36px 22px;text-align:left;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);padding:5px 14px;border-radius:20px;margin-bottom:14px;">
                  <span style="color:#fff;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Global Management Consultants</span>
                </div>
                <p style="color:#94a3b8;font-size:11px;margin:0;letter-spacing:0.5px;">Outplacement Management System · global-dubai.com</p>
              </td>
              <td align="right" valign="middle">
                <div style="width:44px;height:44px;background:linear-gradient(135deg,#7c3aed,#a855f7);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:#fff;font-size:20px;font-weight:900;line-height:44px;display:block;text-align:center;">G</span>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="background:#0f172a;padding:32px 36px;">
          ${content}
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#080b14;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
          <p style="color:#334155;font-size:11px;margin:0 0 6px;">
            <strong style="color:#475569;">Global Management Consultants</strong> · Dubai, UAE
          </p>
          <p style="color:#1e293b;font-size:11px;margin:0;">
            © ${YEAR} Global Management Consultants ·
            <a href="https://global-dubai.com" style="color:#334155;text-decoration:none;">global-dubai.com</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function detailsTable(rows: [string, string][]): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:8px;padding:0;margin:0 0 24px;overflow:hidden;">
    ${rows.map(([label, value]) => `
    <tr>
      <td style="color:#64748b;font-size:13px;padding:8px 16px;width:38%;white-space:nowrap;">${label}</td>
      <td style="color:#e2e8f0;font-size:13px;padding:8px 16px;font-weight:500;">${value}</td>
    </tr>`).join('<tr><td colspan="2" style="padding:0;border-top:1px solid #0f172a;"></td></tr>')}
  </table>`;
}

function ctaButton(text: string, href: string, color = "#7c3aed"): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
    <tr><td style="border-radius:8px;background:${color};">
      <a href="${href}" style="display:inline-block;padding:13px 28px;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">${text}</a>
    </td></tr>
  </table>`;
}

function divider(): string {
  return `<div style="border-top:1px solid #1e293b;margin:24px 0;"></div>`;
}

function footerLink(text: string, href: string): string {
  return `<a href="${href}" style="color:#6366f1;font-size:12px;text-decoration:none;">${text} →</a>`;
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  await sendEmail(to, "Reset Your Password — Global Management Consultants", layout(`
    <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">Password Reset Request 🔐</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${name}</strong>, we received a request to reset your password.
      This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
    </p>
    ${ctaButton("Reset Password", resetUrl)}
    <p style="color:#475569;font-size:12px;margin:0 0 4px;">Or copy this link:</p>
    <p style="color:#6366f1;font-size:12px;word-break:break-all;margin:0 0 24px;">${resetUrl}</p>
    ${divider()}
    <p style="color:#475569;font-size:12px;margin:0;">If you didn't request a password reset, you can safely ignore this email.</p>
  `));
}

// ─── Invite ───────────────────────────────────────────────────────────────────

export async function sendInviteEmail(to: string, name: string, tempPassword: string): Promise<void> {
  await sendEmail(to, "You've been invited to Global Management Consultants OMS", layout(`
    <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">You're Invited 🎉</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${name}</strong>, your account on the
      <strong style="color:#e2e8f0;">Global Management Consultants OMS</strong> has been created.
      Use the temporary password below to sign in — you'll be asked to set a new password immediately.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:8px;margin:0 0 20px;text-align:center;">
      <tr><td style="padding:20px;">
        <p style="color:#64748b;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1.5px;">Temporary Password</p>
        <p style="color:#a78bfa;font-size:26px;font-weight:700;font-family:monospace;margin:0;letter-spacing:3px;">${tempPassword}</p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:14px 16px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Signing in with</p>
        <p style="color:#e2e8f0;font-weight:600;margin:0;font-size:14px;">${to}</p>
      </td></tr>
    </table>
    ${ctaButton("Sign In Now", `${BASE_URL}/login`)}
    ${divider()}
    <p style="color:#475569;font-size:12px;margin:0;">This password is temporary. If you weren't expecting this, contact your administrator.</p>
  `));
}

// ─── Candidate Assigned ───────────────────────────────────────────────────────

export async function sendCandidateAssignedEmail(
  to: string, recipientName: string, role: "Lead Coach" | "Support",
  candidateName: string, candidateId: string, partner: string,
  levelOfSupport: string, duration: string
): Promise<void> {
  const candidateUrl = `${BASE_URL}/outplacement/candidates/${candidateId}`;
  await sendEmail(to, `New Candidate Assigned — ${candidateName}`, layout(`
    <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">New Candidate Assigned 👤</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${recipientName}</strong>, a new candidate has been assigned to you as
      <strong style="color:#a78bfa;">${role}</strong>.
    </p>
    ${detailsTable([
      ["Candidate", `<strong>${candidateName}</strong>`],
      ["Partner / Client", partner],
      ["Level of Support", levelOfSupport],
      ["Programme Duration", duration],
      ["Your Role", `<span style="color:#a78bfa;font-weight:600;">${role}</span>`],
    ])}
    ${ctaButton("View Candidate Profile", candidateUrl)}
    ${divider()}
    <p style="color:#475569;font-size:12px;margin:0;">Log in to the OMS to view full details and manage the programme.</p>
  `));
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail(to, "Welcome to Global Management Consultants — Your account is ready", layout(`
    <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">Welcome Aboard, ${name}! 👋</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
      Your account on the <strong style="color:#e2e8f0;">Global Management Consultants</strong> platform
      has been created and is ready to use.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:14px 16px;">
        <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Signing in with</p>
        <p style="color:#e2e8f0;font-weight:600;margin:0;font-size:14px;">${to}</p>
      </td></tr>
    </table>
    ${ctaButton("Sign In Now", `${BASE_URL}/login`)}
    ${divider()}
    <p style="color:#475569;font-size:12px;margin:0;">If you weren't expecting this email, please contact your administrator.</p>
  `));
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

function buildGoogleCalendarLink(session: Session, candidateName: string, attendeeEmails: string[]): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes]   = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate  = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr   = `${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const description = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${session.title} — ${candidateName}`,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: session.meetingLink || session.location,
  });
  if (attendeeEmails.length) params.append("add", attendeeEmails.join(","));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildICS(session: Session, candidateName: string, attendeeEmails: string[]): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes]   = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate  = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr   = `${endDate.getFullYear()}${pad(endDate.getMonth()+1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const desc = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\\n\\n");
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0",
    "PRODID:-//Global Management Consultants//OMS//EN", "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `DTSTART:${startStr}`, `DTEND:${endStr}`,
    `SUMMARY:${session.title} — ${candidateName}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${session.meetingLink || session.location}`,
    ...attendeeEmails.map((e) => `ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${e}`),
    `UID:${session.id}@gmc-oms`,
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

// ─── Session Invite ───────────────────────────────────────────────────────────

export async function sendSessionInviteEmail(
  to: string, recipientName: string, recipientRole: string,
  session: Session, candidateName: string, candidateId: string,
  allAttendeeEmails: string[]
): Promise<void> {
  const googleLink  = buildGoogleCalendarLink(session, candidateName, allAttendeeEmails);
  const icsContent  = buildICS(session, candidateName, allAttendeeEmails);
  const icsBase64   = Buffer.from(icsContent).toString("base64");
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes]   = session.time.split(":").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
  const durationLabel = session.duration < 60 ? `${session.duration} minutes`
    : session.duration === 60 ? "1 hour"
    : `${Math.floor(session.duration/60)}h ${session.duration%60 ? session.duration%60+"m" : ""}`.trim();
  const candidateUrl = `${BASE_URL}/outplacement/candidates/${candidateId}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[email] RESEND_API_KEY not set"); return; }

  const rows: [string, string][] = [
    ["Session",   `<strong>${session.title}</strong>`],
    ["Candidate", candidateName],
    ["Date",      formattedDate],
    ["Time",      `<strong>${formattedTime}</strong>`],
    ["Duration",  durationLabel],
    ["Location",  session.location],
    ...(session.meetingLink ? [["Meeting Link", `<a href="${session.meetingLink}" style="color:#a78bfa;">${session.meetingLink}</a>`] as [string,string]] : []),
    ...(session.notes ? [["Notes", `<span style="color:#94a3b8;">${session.notes}</span>`] as [string,string]] : []),
  ];

  const html = layout(`
    <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">Session Scheduled 📅</h2>
    <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
      Hi <strong style="color:#e2e8f0;">${recipientName}</strong>, a coaching session has been scheduled
      ${recipientRole ? `— you are the <strong style="color:#e2e8f0;">${recipientRole}</strong>.` : "."}
    </p>
    ${detailsTable(rows)}
    ${ctaButton("Add to Google Calendar", googleLink)}
    <p style="color:#475569;font-size:12px;margin:-16px 0 24px;">A calendar (.ics) file is also attached — open it to add to any calendar app.</p>
    ${divider()}
    ${footerLink("View candidate profile in OMS", candidateUrl)}
  `);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM, to,
      subject: `Session Scheduled: ${session.title} — ${candidateName} · ${formattedDate}`,
      html,
      attachments: [{
        filename: `${session.title.replace(/\s+/g,"_")}.ics`,
        content: icsBase64,
        content_type: "text/calendar; method=REQUEST; charset=utf-8",
      }],
    }),
  });
  if (!res.ok) { const b = await res.text(); throw new Error(`Resend error ${res.status}: ${b}`); }
}

// ─── Session Cancellation ─────────────────────────────────────────────────────

export async function sendSessionCancellationEmail(
  to: string, recipientName: string, session: Session,
  candidateName: string, candidateId: string
): Promise<void> {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes]   = session.time.split(":").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;
  const candidateUrl  = `${BASE_URL}/outplacement/candidates/${candidateId}`;

  await sendEmail(
    to,
    `Session Cancelled: ${session.title} — ${candidateName} · ${formattedDate}`,
    layout(`
      <h2 style="color:#f87171;margin:0 0 6px;font-size:22px;">Session Cancelled ❌</h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
        Hi <strong style="color:#e2e8f0;">${recipientName}</strong>, the following session has been
        <strong style="color:#f87171;">cancelled</strong>.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:8px;margin:0 0 24px;border-left:3px solid #f87171;overflow:hidden;">
        ${[
          ["Session",   `<span style="text-decoration:line-through;">${session.title}</span>`],
          ["Candidate", candidateName],
          ["Date",      `<span style="text-decoration:line-through;color:#94a3b8;">${formattedDate}</span>`],
          ["Time",      `<span style="text-decoration:line-through;color:#94a3b8;">${formattedTime}</span>`],
          ...(session.location ? [["Location", session.location]] : []),
        ].map(([l,v]) => `<tr><td style="color:#64748b;font-size:13px;padding:8px 16px;width:38%;">${l}</td><td style="color:#e2e8f0;font-size:13px;padding:8px 16px;">${v}</td></tr>`).join("")}
      </table>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Please remove this event from your calendar. A new session will be scheduled if required.
      </p>
      ${divider()}
      ${footerLink("View candidate profile in OMS", candidateUrl)}
    `)
  );
}

// ─── Session Reminder (candidate 24hr) ───────────────────────────────────────

export async function sendSessionReminderEmail(
  to: string, candidateName: string, session: Session,
  coachName: string, portalUrl: string
): Promise<void> {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes]   = session.time.split(":").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formattedTime = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

  const rows: [string, string][] = [
    ["Session",   `<strong>${session.title}</strong>`],
    ["Date",      formattedDate],
    ["Time",      `<strong style="color:#a78bfa;">${formattedTime}</strong>`],
    ["Duration",  `${session.duration} minutes`],
    ...(session.location  ? [["Location",     session.location] as [string,string]] : []),
    ...(session.meetingLink ? [["Meeting Link", `<a href="${session.meetingLink}" style="color:#818cf8;">${session.meetingLink}</a>`] as [string,string]] : []),
    ["Coach", coachName],
  ];

  await sendEmail(
    to,
    `Reminder: Your session tomorrow — ${session.title} at ${formattedTime}`,
    layout(`
      <h2 style="color:#a78bfa;margin:0 0 6px;font-size:22px;">Session Reminder ⏰</h2>
      <p style="color:#94a3b8;margin:0 0 24px;font-size:14px;line-height:1.6;">
        Hi <strong style="color:#e2e8f0;">${candidateName}</strong>, this is your reminder about your
        session <strong style="color:#e2e8f0;">tomorrow</strong>.
      </p>
      ${detailsTable(rows)}
      ${session.meetingLink ? ctaButton("Join Session →", session.meetingLink) : ""}
      <p style="color:#64748b;font-size:13px;margin:0 0 24px;line-height:1.6;">
        If you need to reschedule or have questions, please contact your coach directly.
      </p>
      ${divider()}
      ${footerLink("View your programme in the candidate portal", portalUrl)}
    `)
  );
}
