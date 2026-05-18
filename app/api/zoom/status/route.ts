import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getZoomTokens } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ connected: false });
  const tokens = await getZoomTokens(session.user.id);
  return NextResponse.json({ connected: !!tokens });
}
