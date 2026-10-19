import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// One-time admin password reset endpoint — DELETE THIS FILE AFTER USE
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-reset-secret");
  if (secret !== process.env.RESET_ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, newPassword } = await req.json();
  if (!email || !newPassword) {
    return NextResponse.json({ error: "email and newPassword required" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  const { data, error } = await supabase
    .from("users")
    .update({ password: hash, disabled: false })
    .eq("email", email)
    .select("id, email, role")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ok: true, updated: data });
}
