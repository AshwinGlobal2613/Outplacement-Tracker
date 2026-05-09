import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { CandidateActivity } from "@/lib/types";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const activity: CandidateActivity = {
    id: `act_${uuidv4().slice(0, 8)}`,
    type: body.type,
    title: body.title,
    link: body.link || "",
    notes: body.notes || "",
    createdAt: new Date().toISOString(),
    createdBy: session.user.name || "Unknown",
  };

  const activities = [...(candidate.activities ?? []), activity];
  const updated = updateCandidate(params.id, { activities });
  return NextResponse.json(updated, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { activityId } = await req.json();
  const activities = (candidate.activities ?? []).filter((a) => a.id !== activityId);
  const updated = updateCandidate(params.id, { activities });
  return NextResponse.json(updated);
}
