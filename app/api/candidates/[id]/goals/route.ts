import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { WeeklyGoal } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(candidate.goals ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "team_member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const goal: WeeklyGoal = {
    id: `goal_${uuidv4().slice(0, 8)}`,
    title: body.title,
    description: body.description ?? "",
    targetCount: Number(body.targetCount) || 1,
    currentCount: 0,
    weekLabel: body.weekLabel ?? "",
    dueDate: body.dueDate ?? undefined,
    completed: false,
    createdAt: new Date().toISOString(),
    createdBy: session.user.name ?? session.user.email ?? "Unknown",
  };

  const goals = [...(candidate.goals ?? []), goal];
  const updated = await updateCandidate(params.id, { goals });
  return NextResponse.json({ candidate: updated, goal });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { goalId, ...updates } = body;

  const goals = (candidate.goals ?? []).map((g) => {
    if (g.id !== goalId) return g;
    const merged = { ...g, ...updates };
    // auto-complete when target reached
    if (merged.currentCount >= merged.targetCount) merged.completed = true;
    return merged;
  });

  const updated = await updateCandidate(params.id, { goals });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "team_member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { goalId } = await req.json();
  const goals = (candidate.goals ?? []).filter((g) => g.id !== goalId);
  const updated = await updateCandidate(params.id, { goals });
  return NextResponse.json(updated);
}
