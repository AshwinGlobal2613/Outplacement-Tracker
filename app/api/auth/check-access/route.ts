import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ allowed: false, reason: "unauthenticated" }, { status: 401 });
  }

  let user;
  try {
    user = await getUserById(session.user.id);
  } catch {
    // DB unavailable — fail open so a transient error doesn't log everyone out
    return NextResponse.json({ allowed: true });
  }

  if (!user) {
    return NextResponse.json({ allowed: false, reason: "deleted" });
  }
  if (user.disabled) {
    return NextResponse.json({ allowed: false, reason: "disabled" });
  }

  return NextResponse.json({ allowed: true });
}
