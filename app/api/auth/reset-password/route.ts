import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getResetToken, markResetTokenUsed, updateUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });

  const resetToken = await getResetToken(token);
  if (!resetToken) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  if (resetToken.used) return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
  if (new Date(resetToken.expiresAt) < new Date()) return NextResponse.json({ error: "Reset link has expired" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);
  await updateUser(resetToken.userId, { password: hashed });
  await markResetTokenUsed(resetToken.id);

  return NextResponse.json({ message: "Password updated successfully" });
}
