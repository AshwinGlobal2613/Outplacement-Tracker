import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActivityLogForCandidate, addActivityLog, getCandidate } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logs = await getActivityLogForCandidate(params.id);
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json() as { action: string };
  if (!action?.trim()) return NextResponse.json({ error: "action is required" }, { status: 400 });

  const candidate = await getCandidate(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await addActivityLog({
    id: uuidv4(),
    userId: session.user.id ?? "",
    userName: session.user.name ?? session.user.email ?? "Unknown",
    action: action.trim(),
    entityType: "candidate",
    entityId: params.id,
    entityName: candidate.candidateName,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
