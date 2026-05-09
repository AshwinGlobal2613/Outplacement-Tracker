const FROM = `"Global Management Consultants" <${process.env.SMTP_FROM || "team@global-dubai.com"}>`;
const BASE_URL = process.env.NEXTAUTH_URL || "https://outplacement-tracker-production.up.railway.app";

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
      <p style="color:#94a3b8;margin:0 0 20px;">Your account on the <strong style="color:#e2e8f0;">Global Outplacement Management System</strong> has been created and is ready to use.</p>
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
