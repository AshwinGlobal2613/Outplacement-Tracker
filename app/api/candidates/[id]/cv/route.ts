import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate } from "@/lib/db";
import { CVProfile } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(candidate.cvProfile ?? null);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only admin, team_member, or the candidate themselves can update
  const isStaff = session.user.role === "admin" || session.user.role === "team_member";
  const isOwner = session.user.role === "candidate" && session.user.candidateId === params.id;
  if (!isStaff && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const cvProfile: CVProfile = {
    headline: body.headline ?? "",
    summary: body.summary ?? "",
    linkedinAbout: body.linkedinAbout ?? "",
    skills: body.skills ?? [],
    experience: body.experience ?? [],
    education: body.education ?? [],
    updatedAt: new Date().toISOString(),
  };

  const updated = await updateCandidate(params.id, { cvProfile });
  return NextResponse.json(updated.cvProfile);
}
