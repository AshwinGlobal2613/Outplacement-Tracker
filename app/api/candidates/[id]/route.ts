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
  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(candidate);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Fetch current candidate to detect status transition
  const before = await getCandidateById(params.id);

  // Auto-set discDone based on whether discStyle is filled in
  if (body.discStyle !== undefined) {
    body.discDone = body.discStyle?.trim() ? "Done" : "Not Done";
  }

  const updated = await updateCandidate(params.id, { ...body, updatedBy: session.user.id });
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Send Slack notification when status changes to "completed"
  const becameCompleted = body.status === "completed" && before?.status !== "completed";
  if (becameCompleted && process.env.SLACK_WEBHOOK_URL) {
    const lines = [
      `✅ *Program Completed: ${updated.candidateName}*`,
      updated.clientName ? `*Client:* ${updated.clientName}` : null,
      updated.partner ? `*Partner:* ${updated.partner}` : null,
      updated.leadCoach ? `*Lead Coach:* ${updated.leadCoach}` : null,
      updated.duration ? `*Duration:* ${updated.duration}` : null,
      updated.newPlacement ? `*New Placement:* ${updated.newPlacement}` : null,
      updated.position ? `*Position:* ${updated.position}` : null,
      `*Marked completed by:* ${session.user.name || session.user.email}`,
    ].filter(Boolean).join("\n");

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines }),
    }).catch(() => {}); // non-blocking — don't fail the request if Slack is down
  }

  await addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "updated",
    entityType: "candidate",
    entityId: updated.id,
    entityName: updated.candidateName,
    createdAt: new Date().toISOString(),
  });

  await createNotificationsForAllUsers(
    session.user.id,
    `${session.user.name} updated candidate: ${updated.candidateName}`,
    `/outplacement/candidates/${updated.id}`
  );

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteCandidate(params.id);

  await addActivityLog({
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
