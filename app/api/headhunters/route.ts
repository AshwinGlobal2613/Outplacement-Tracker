import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getHeadhunters, createHeadhunter, addActivityLog } from "@/lib/db";
import { Headhunter } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getHeadhunters());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const hh: Headhunter = { id: `hh_${uuidv4().slice(0, 8)}`, ...body };
  await createHeadhunter(hh);
  await addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "created",
    entityType: "headhunter",
    entityId: hh.id,
    entityName: hh.name,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(hh, { status: 201 });
}
