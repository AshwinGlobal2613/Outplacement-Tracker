import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getUserByEmail, createResetToken } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const user = await getUserByEmail(email);
  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ message: "If that email exists, a reset link has been sent." });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await createResetToken({
    id: `rst_${uuidv4().slice(0, 8)}`,
    userId: user.id,
    token,
    expiresAt,
    used: false,
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  // Fire-and-forget — respond immediately, email delivers in background
  sendPasswordResetEmail(email, user.name, resetUrl).catch((err) =>
    console.error("[reset-email]", err)
  );

  return NextResponse.json({ message: "If that email exists, a reset link has been sent." });
}
