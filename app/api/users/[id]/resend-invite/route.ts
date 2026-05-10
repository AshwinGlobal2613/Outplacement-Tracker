import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserById(params.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate a fresh temp password and reset the flag
  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 10);
  await updateUser(params.id, { password: hashed, mustChangePassword: true });

  sendInviteEmail(user.email, user.name, tempPassword).catch((err) =>
    console.error("[resend-invite-email]", err)
  );

  return NextResponse.json({ success: true });
}
