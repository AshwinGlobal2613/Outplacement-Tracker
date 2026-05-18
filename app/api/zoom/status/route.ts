import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getZoomTokens } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return NextResponse.json({ connected: false });
  const tokens = await getZoomTokens(token.id as string);
  return NextResponse.json({ connected: !!tokens });
}
