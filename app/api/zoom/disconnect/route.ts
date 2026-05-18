import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { deleteZoomTokens } from "@/lib/db";

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await deleteZoomTokens(token.id as string);
  return NextResponse.json({ ok: true });
}
