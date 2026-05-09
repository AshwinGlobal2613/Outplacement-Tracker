import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, unknown> = {};

  // 1. Check Supabase connection
  try {
    const { data, error } = await supabase.from("users").select("id, email, role, disabled").limit(5);
    results.supabaseConnected = !error;
    results.usersFound = data?.length ?? 0;
    results.users = data?.map(u => ({ id: u.id, email: u.email, role: u.role }));
    if (error) results.supabaseError = error.message;
  } catch (e) {
    results.supabaseConnected = false;
    results.supabaseException = String(e);
  }

  // 2. Try fetching ashwin@global-dubai.com
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", "ashwin@global-dubai.com")
      .maybeSingle();
    results.userFound = !!data;
    if (error) results.userQueryError = error.message;
    if (data) {
      results.userId = data.id;
      results.userRole = data.role;
      results.userDisabled = data.disabled;
      results.hasPassword = !!data.password;
      // Test bcrypt
      const match = await bcrypt.compare("Global206", data.password);
      results.passwordMatch = match;
    }
  } catch (e) {
    results.userQueryException = String(e);
  }

  // 3. Check env vars are set
  results.envVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "NOT SET",
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET",
  };

  return NextResponse.json(results);
}
