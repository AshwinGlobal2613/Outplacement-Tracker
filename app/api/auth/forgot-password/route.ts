import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getUserByEmail, createResetToken } from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = getUserByEmail(email);
  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  createResetToken({
    id: `rst_${uuidv4().slice(0, 8)}`,
    userId: user.id,
    token,
    expiresAt,
    used: false,
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Try to send email if SMTP configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Global OMS" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset your Global OMS password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#0f172a;color:#e2e8f0;padding:32px;border-radius:12px;">
          <h2 style="color:#a78bfa;margin-bottom:8px;">Password Reset</h2>
          <p style="color:#94a3b8;">Hi ${user.name},</p>
          <p style="color:#94a3b8;">Click the link below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#475569;font-size:12px;">Or copy this link: ${resetUrl}</p>
          <p style="color:#475569;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>`,
    });

    return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
  }

  // No SMTP: return the reset URL directly (admin shares manually)
  return NextResponse.json({
    message: "Reset link generated. Email is not configured â€” share this link manually.",
    resetUrl,
    devMode: true,
  });
}
