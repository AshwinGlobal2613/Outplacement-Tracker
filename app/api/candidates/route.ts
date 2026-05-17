import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import {
  getCandidates,
  createCandidate,
  createNotificationsForAllUsers,
  addActivityLog,
  getUsers,
} from "@/lib/db";
import { Candidate } from "@/lib/types";
import { sendCandidateAssignedEmail } from "@/lib/email";

export async function GET() {
  const candidates = await getCandidates();
  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // All authenticated users can create candidates

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

  await createCandidate(candidate);

  await addActivityLog({
    id: `log_${uuidv4().slice(0, 8)}`,
    userId: session.user.id,
    userName: session.user.name || "Unknown",
    action: "created",
    entityType: "candidate",
    entityId: candidate.id,
    entityName: candidate.candidateName,
    createdAt: now,
  });

  await createNotificationsForAllUsers(
    session.user.id,
    `${session.user.name} added new candidate: ${candidate.candidateName}`,
    `/outplacement/candidates/${candidate.id}`
  );

  // Fire-and-forget: email the assigned Lead Coach and Support
  if (candidate.leadCoach || candidate.support) {
    getUsers()
      .then((users) => {
        const emailPromises: Promise<void>[] = [];

        if (candidate.leadCoach) {
          const coach = users.find(
            (u) => u.name.trim().toLowerCase() === candidate.leadCoach.trim().toLowerCase()
          );
          if (coach?.email) {
            emailPromises.push(
              sendCandidateAssignedEmail(
                coach.email,
                coach.name,
                "Lead Coach",
                candidate.candidateName,
                candidate.id,
                candidate.partner,
                candidate.levelOfSupport,
                candidate.duration
              ).catch((err) =>
                console.error("[email] Lead Coach notification failed:", err)
              )
            );
          }
        }

        if (candidate.support) {
          const support = users.find(
            (u) => u.name.trim().toLowerCase() === candidate.support.trim().toLowerCase()
          );
          if (support?.email) {
            emailPromises.push(
              sendCandidateAssignedEmail(
                support.email,
                support.name,
                "Support",
                candidate.candidateName,
                candidate.id,
                candidate.partner,
                candidate.levelOfSupport,
                candidate.duration
              ).catch((err) =>
                console.error("[email] Support notification failed:", err)
              )
            );
          }
        }

        return Promise.all(emailPromises);
      })
      .catch((err) => console.error("[email] Failed to fetch users for notifications:", err));
  }

  return NextResponse.json(candidate, { status: 201 });
}
