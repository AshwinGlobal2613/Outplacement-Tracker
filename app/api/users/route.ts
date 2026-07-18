import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { createUser, getUserByEmail, getUsers } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  let pwd = "";
  for (let i = 0; i < 10; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getUsers();

  // Admins get the full user list (minus password)
  if (session.user.role === "admin") {
    return NextResponse.json(users.map(({ password: _, ...u }) => u));
  }

  // All other authenticated roles get a minimal safe subset for invite purposes
  // (name, email, additionalEmails only — no roles, no passwords, no internal fields)
  const safe = users
    .filter((u) => !u.disabled && (u.role === "admin" || u.role === "team_member"))
    .map((u) => ({ id: u.id, name: u.name, email: u.email, additionalEmails: u.additionalEmails ?? [] }));
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const isAdminInvite = session?.user?.role === "admin";

  const body = await req.json();
  const { name, email, phone = "", role = "team_member", clientCompany, candidateId, additionalEmails = [] } = body;

  if (!name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  // Admin invites: auto-generate temp password and force change on first login
  // Self-registration: use provided password
  let plainPassword: string;
  let mustChangePassword = false;

  if (isAdminInvite) {
    plainPassword = generateTempPassword();
    mustChangePassword = true;
  } else {
    plainPassword = body.password ?? "";
    if (!plainPassword || plainPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
  }

  const hashed = await bcrypt.hash(plainPassword, 10);
  const user = await createUser({
    id: `usr_${uuidv4().slice(0, 8)}`,
    name,
    email,
    phone,
    password: hashed,
    role,
    clientCompany: role === "client" ? (clientCompany ?? "") : undefined,
    candidateId: role === "candidate" ? (candidateId ?? "") : undefined,
    additionalEmails,
    disabled: false,
    mustChangePassword,
    createdAt: new Date().toISOString(),
  });

  if (isAdminInvite) {
    sendInviteEmail(email, name, plainPassword).catch((err) =>
      console.error("[invite-email]", err)
    );
  }

  const { password: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
