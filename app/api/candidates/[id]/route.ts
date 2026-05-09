import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import {
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  createNotificationsForAllUsers,
  addActivityLog,
} from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const candidate = getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(candidate);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updated = updateCandidate(params.id, { ...body, updatedBy: session.user.id });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "updated",
    entityType: "candidate",
    entityId: updated.id,
    entityName: updated.candidateName,
    createdAt: new Date().toISOString(),
  });

  createNotificationsForAllUsers(
    session.user.id,
    `${session.user.name} updated candidate: ${updated.candidateName}`,
    `/outplacement/candidates/${updated.id}`
  );

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  deleteCandidate(params.id);

  addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "deleted",
    entityType: "candidate",
    entityId: params.id,
    entityName: candidate.candidateName,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
