import type { Session } from "./types";

const FROM = `"Global Management Consultants" <${process.env.SMTP_FROM || "team@global-dubai.com"}>`;
const BASE_URL = process.env.NEXTAUTH_URL || "https://outplacement-tracker-drab.vercel.app";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<void> {
  await sendEmail(
    to,
    "Reset Your Password",
    `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:36px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:#7c3aed;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Global Management Consultants</span>
      </div>
      <h2 style="color:#a78bfa;margin:0 0 8px;">Password Reset Request</h2>
      <p style="color:#94a3b8;margin:0 0 20px;">Hi ${name},</p>
      <p style="color:#94a3b8;margin:0 0 24px;">We received a request to reset your password. Click the button below — this link expires in <strong style="color:#e2e8f0;">1 hour</strong>.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        Reset Password
      </a>
      <p style="color:#475569;font-size:12px;margin:0 0 4px;">Or copy this link into your browser:</p>
      <p style="color:#6366f1;font-size:12px;word-break:break-all;margin:0 0 24px;">${resetUrl}</p>
      <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 16px;" />
      <p style="color:#475569;font-size:12px;margin:0;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
    </div>`
  );
}

export async function sendInviteEmail(
  to: string,
  name: string,
  tempPassword: string
): Promise<void> {
  await sendEmail(
    to,
    "You've been invited to Global Management Consultants OMS",
    `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:36px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:#7c3aed;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Global Management Consultants</span>
      </div>
      <h2 style="color:#a78bfa;margin:0 0 8px;">You're invited! 🎉</h2>
      <p style="color:#94a3b8;margin:0 0 20px;">Hi ${name}, an admin has created an account for you on the <strong style="color:#e2e8f0;">Global Management Consultants OMS</strong>.</p>
      <p style="color:#94a3b8;margin:0 0 16px;">Use the temporary password below to sign in. You'll be asked to set a new password immediately after logging in.</p>
      <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin:0 0 24px;text-align:center;">
        <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Temporary Password</p>
        <p style="color:#a78bfa;font-size:22px;font-weight:700;font-family:monospace;margin:0;letter-spacing:2px;">${tempPassword}</p>
      </div>
      <div style="background:#1e293b;border-radius:8px;padding:14px 20px;margin:0 0 24px;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Signing in with:</p>
        <p style="color:#e2e8f0;font-weight:600;margin:0;">${to}</p>
      </div>
      <a href="${BASE_URL}/login" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        Sign In Now
      </a>
      <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 16px;" />
      <p style="color:#475569;font-size:12px;margin:0;">This password is temporary and will expire after your first login. If you weren't expecting this, contact your administrator.</p>
    </div>`
  );
}

export async function sendCandidateAssignedEmail(
  to: string,
  recipientName: string,
  role: "Lead Coach" | "Support",
  candidateName: string,
  candidateId: string,
  partner: string,
  levelOfSupport: string,
  duration: string
): Promise<void> {
  const candidateUrl = `${BASE_URL}/outplacement/candidates/${candidateId}`;
  await sendEmail(
    to,
    `New Candidate Assigned — ${candidateName}`,
    `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:36px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:#7c3aed;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Global Management Consultants</span>
      </div>
      <h2 style="color:#a78bfa;margin:0 0 8px;">New Candidate Assigned</h2>
      <p style="color:#94a3b8;margin:0 0 20px;">Hi ${recipientName}, a new candidate has been assigned to you as <strong style="color:#e2e8f0;">${role}</strong>.</p>
      <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="color:#64748b;font-size:13px;padding:5px 0;">Candidate</td><td style="color:#e2e8f0;font-weight:600;font-size:13px;padding:5px 0;">${candidateName}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;padding:5px 0;">Partner / Client</td><td style="color:#e2e8f0;font-size:13px;padding:5px 0;">${partner}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;padding:5px 0;">Level of Support</td><td style="color:#e2e8f0;font-size:13px;padding:5px 0;">${levelOfSupport}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;padding:5px 0;">Programme Duration</td><td style="color:#e2e8f0;font-size:13px;padding:5px 0;">${duration}</td></tr>
          <tr><td style="color:#64748b;font-size:13px;padding:5px 0;">Your Role</td><td style="color:#a78bfa;font-weight:600;font-size:13px;padding:5px 0;">${role}</td></tr>
        </table>
      </div>
      <a href="${candidateUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        View Candidate Profile
      </a>
      <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 16px;" />
      <p style="color:#475569;font-size:12px;margin:0;">You received this email because you were assigned to this candidate. Log in to the OMS to view full details.</p>
    </div>`
  );
}

export async function sendWelcomeEmail(
  to: string,
  name: string
): Promise<void> {
  await sendEmail(
    to,
    "Welcome to Global Management Consultants — Your account is ready",
    `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:36px;border-radius:12px;">
      <div style="margin-bottom:24px;">
        <span style="background:#7c3aed;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Global Management Consultants</span>
      </div>
      <h2 style="color:#a78bfa;margin:0 0 8px;">Welcome aboard, ${name}! 👋</h2>
      <p style="color:#94a3b8;margin:0 0 20px;">Your account on the <strong style="color:#a78bfa;">Global Management Consultants</strong> platform has been created and is ready to use.</p>
      <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 4px;">Signing in with:</p>
        <p style="color:#e2e8f0;font-weight:600;margin:0;">${to}</p>
      </div>
      <a href="${BASE_URL}/login" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:24px;">
        Sign In Now
      </a>
      <hr style="border:none;border-top:1px solid #1e293b;margin:0 0 16px;" />
      <p style="color:#475569;font-size:12px;margin:0;">If you weren't expecting this email, please contact your administrator.</p>
    </div>`
  );
}

// ─── Session Invite ───────────────────────────────────────────────────────────

function buildGoogleCalendarLink(session: Session, candidateName: string, attendeeEmails: string[]): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const description =
    `Candidate: ${candidateName}` +
    (session.meetingLink ? `\nMeeting Link: ${session.meetingLink}` : "") +
    (session.notes ? `\n\nNotes: ${session.notes}` : "");
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
  const [hours, minutes] = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const description =
    `Candidate: ${candidateName}` +
    (session.notes ? `\\nNotes: ${session.notes}` : "");
  const attendeeLines = attendeeEmails.map((e) => `ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${e}`).join("\r\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Global Management Consultants//OMS//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${session.title} — ${candidateName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${session.meetingLink || session.location}`,
    attendeeLines,
    `UID:${session.id}@gmc-oms`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

export async function sendSessionInviteEmail(
  to: string,
  recipientName: string,
  recipientRole: string,
  session: Session,
  candidateName: string,
  candidateId: string,
  allAttendeeEmails: string[]
): Promise<void> {
  const googleLink = buildGoogleCalendarLink(session, candidateName, allAttendeeEmails);
  const icsContent = buildICS(session, candidateName, allAttendeeEmails);
  const icsBase64 = Buffer.from(icsContent).toString("base64");

  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const durationLabel = session.duration < 60
    ? `${session.duration} minutes`
    : session.duration === 60 ? "1 hour"
    : `${Math.floor(session.duration / 60)}h ${session.duration % 60 ? session.duration % 60 + "m" : ""}`.trim();

  const candidateUrl = `${BASE_URL}/outplacement/candidates/${candidateId}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping session invite email");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to,
      subject: `Session Scheduled: ${session.title} — ${candidateName} · ${formattedDate}`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:36px;border-radius:12px;">
        <div style="margin-bottom:24px;">
          <span style="background:#7c3aed;color:#fff;padding:6px 14px;border-radius:6px;font-size:13px;font-weight:600;letter-spacing:0.5px;">Global Management Consultants</span>
        </div>
        <h2 style="color:#a78bfa;margin:0 0 8px;">Session Scheduled 📅</h2>
        <p style="color:#94a3b8;margin:0 0 20px;">Hi ${recipientName}, a coaching session has been scheduled${recipientRole ? ` (you are the <strong style="color:#e2e8f0;">${recipientRole}</strong>)` : ""}.</p>
        <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;width:40%;">Session</td><td style="color:#e2e8f0;font-weight:600;font-size:13px;padding:6px 0;">${session.title}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Candidate</td><td style="color:#e2e8f0;font-size:13px;padding:6px 0;">${candidateName}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Date</td><td style="color:#e2e8f0;font-size:13px;padding:6px 0;">${formattedDate}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Time</td><td style="color:#e2e8f0;font-size:13px;padding:6px 0;">${formattedTime}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Duration</td><td style="color:#e2e8f0;font-size:13px;padding:6px 0;">${durationLabel}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Location</td><td style="color:#e2e8f0;font-size:13px;padding:6px 0;">${session.location}</td></tr>
            ${session.meetingLink ? `<tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Link</td><td style="font-size:13px;padding:6px 0;"><a href="${session.meetingLink}" style="color:#a78bfa;">${session.meetingLink}</a></td></tr>` : ""}
            ${session.notes ? `<tr><td style="color:#64748b;font-size:13px;padding:6px 0;">Notes</td><td style="color:#94a3b8;font-size:13px;padding:6px 0;">${session.notes}</td></tr>` : ""}
          </table>
        </div>
        <a href="${googleLink}" style="display:inline-block;background:#7c3aed;color:#fff;padding:13px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:12px;">
          Add to Google Calendar
        </a>
        <p style="color:#475569;font-size:12px;margin:12px 0 0;">A calendar invite (.ics) is attached to this email — open it to add directly to any calendar app.</p>
        <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0;" />
        <a href="${candidateUrl}" style="color:#6366f1;font-size:12px;">View candidate profile in OMS →</a>
      </div>`,
      attachments: [{
        filename: `${session.title.replace(/\s+/g, "_")}.ics`,
        content: icsBase64,
      }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}
