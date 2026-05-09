import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getTransitions, createTransition, addActivityLog } from "@/lib/db";
import { Transition } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getTransitions());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const transition: Transition = { id: `trans_${uuidv4().slice(0, 8)}`, ...body };
  await createTransition(transition);
  await addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "created",
    entityType: "transition",
    entityId: transition.id,
    entityName: transition.candidateName,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(transition, { status: 201 });
}
