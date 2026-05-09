import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { createUser, getUserByEmail, getUsers } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const users = (await getUsers()).map(({ password: _, ...u }) => u);
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, password, phone = "", role = "team_member" } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({
    id: `usr_${uuidv4().slice(0, 8)}`,
    name,
    email,
    phone,
    password: hashed,
    role,
    disabled: false,
    createdAt: new Date().toISOString(),
  });

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendWelcomeEmail(email, name).catch((err) =>
    console.error("[welcome-email]", err)
  );

  const { password: _, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}
