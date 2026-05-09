import { NextRequest, NextResponse } from "next/server";
import { getLists, addToList } from "@/lib/db";
import { Lists } from "@/lib/types";

export async function GET() {
  return NextResponse.json(getLists());
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { key, value } = body as { key: keyof Lists; value: string };
  if (!key || !value) return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
  addToList(key, value.trim());
  return NextResponse.json(getLists());
}
