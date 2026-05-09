import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import {
  getCandidates,
  createCandidate,
  createNotificationsForAllUsers,
  addActivityLog,
} from "@/lib/db";
import { Candidate } from "@/lib/types";

export async function GET() {
  const candidates = getCandidates();
  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });

  const body = await req.json();
  const now = new Date().toISOString();

  const candidate: Candidate = {
    id: `cand_${uuidv4().slice(0, 8)}`,
    status: body.status || "referred",
    partner: body.partner || "",
    clientName: body.clientName || "",
    candidateName: body.candidateName || "",
    levelOfSupport: body.levelOfSupport || "Low",
    leadCoach: body.leadCoach || "",
    support: body.support || "",
    email: body.email || "",
    whatsapp: body.whatsapp || "",
    linkedin: body.linkedin || "",
    duration: body.duration || "3 Months",
    dateStarted: body.dateStarted || null,
    endDate: body.endDate || null,
    sessionsCompleted: body.sessionsCompleted || 0,
    notes: body.notes || "",
    discStyle: body.discStyle || "",
    jobStatus: body.jobStatus || null,
    newCompany: body.newCompany || null,
    newPlacement: body.newPlacement || null,
    position: body.position || null,
    sector: body.sector || null,
    oldPlacement: body.oldPlacement || null,
    progress: body.progress || {
      introductorySession: false,
      cvSessions: false,
      linkedinProfile: false,
      profiling: false,
      networkingPersonalBranding: false,
    },
    activities: [],
    discDone: body.discDone || "Not Done",
    invoiceStatus: body.invoiceStatus || "Not Raised",
    costingStatus: body.costingStatus || "Not Done",
    createdAt: now,
    updatedAt: now,
    updatedBy: session.user.id,
  };

  createCandidate(candidate);

  addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "created",
    entityType: "candidate",
    entityId: candidate.id,
    entityName: candidate.candidateName,
    createdAt: now,
  });

  createNotificationsForAllUsers(
    session.user.id,
    `${session.user.name} added new candidate: ${candidate.candidateName}`,
    `/outplacement/candidates/${candidate.id}`
  );

  return NextResponse.json(candidate, { status: 201 });
}
