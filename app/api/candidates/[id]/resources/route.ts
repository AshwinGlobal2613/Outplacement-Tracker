import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { CandidateResource } from "@/lib/types";

// GET — list resources for a candidate (admin/team/owner-candidate)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(candidate.candidateResources ?? []);
}

// POST — add a resource (admin/team only)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "team_member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  if (!body.title || !body.url) return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });

  const resource: CandidateResource = {
    id: `res_${uuidv4().slice(0, 8)}`,
    title: body.title,
    description: body.description ?? "",
    type: body.type ?? "link",
    url: body.url,
    fileName: body.fileName,
    addedBy: session.user.id,
    addedByName: session.user.name ?? "Unknown",
    addedAt: new Date().toISOString(),
  };

  const existing = candidate.candidateResources ?? [];
  await updateCandidate(params.id, { candidateResources: [...existing, resource] });

  return NextResponse.json(resource, { status: 201 });
}

// DELETE — remove a resource (admin/team only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && session.user.role !== "team_member") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { resourceId } = await req.json();
  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = (candidate.candidateResources ?? []).filter((r) => r.id !== resourceId);
  await updateCandidate(params.id, { candidateResources: updated });

  return NextResponse.json({ success: true });
}
