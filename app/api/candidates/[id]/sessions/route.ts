import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate, getUsers } from "@/lib/db";
import { Session } from "@/lib/types";
import { sendSessionInviteEmail } from "@/lib/email";
import { createCalendarEvent, deleteCalendarEvent, isGoogleCalendarConfigured } from "@/lib/google-calendar";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(candidate.sessions ?? []);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const newSession: Session = {
    id: `sess_${uuidv4().slice(0, 8)}`,
    type: body.type || "Session",
    title: body.title || "Session",
    date: body.date,
    time: body.time,
    duration: body.duration || 60,
    location: body.location || "Google Meet",
    meetingLink: body.meetingLink || "",
    notes: body.notes || "",
    createdAt: new Date().toISOString(),
    createdBy: authSession.user.name || "Unknown",
  };

  // If Google Calendar is configured, create the event there first
  // (Google handles sending invites to all attendees automatically)
  if (isGoogleCalendarConfigured()) {
    try {
      const users = await getUsers();
      const coachUser = candidate.leadCoach
        ? users.find((u) => u.name.trim().toLowerCase() === candidate.leadCoach.trim().toLowerCase())
        : null;
      const supportUser = candidate.support
        ? users.find((u) => u.name.trim().toLowerCase() === candidate.support.trim().toLowerCase())
        : null;
      const allEmails = [candidate.email, coachUser?.email, supportUser?.email].filter(Boolean) as string[];

      const googleEventId = await createCalendarEvent(newSession, candidate.candidateName, allEmails);
      if (googleEventId) newSession.googleEventId = googleEventId;
    } catch (err) {
      console.error("[google-calendar] Failed to create calendar event:", err);
    }
  }

  const sessions = [...(candidate.sessions ?? []), newSession];
  const updated = await updateCandidate(params.id, { sessions });

  // Fire-and-forget: also send email invites (with .ics) regardless of Google Calendar
  getUsers()
    .then((users) => {
      const coachUser = candidate.leadCoach
        ? users.find((u) => u.name.trim().toLowerCase() === candidate.leadCoach.trim().toLowerCase())
        : null;
      const supportUser = candidate.support
        ? users.find((u) => u.name.trim().toLowerCase() === candidate.support.trim().toLowerCase())
        : null;

      // Collect all attendee emails for calendar invite
      const allEmails = [candidate.email, coachUser?.email, supportUser?.email].filter(Boolean) as string[];

      const invites: Promise<void>[] = [];

      // Candidate
      if (candidate.email) {
        invites.push(
          sendSessionInviteEmail(
            candidate.email, candidate.candidateName, "Candidate",
            newSession, candidate.candidateName, candidate.id, allEmails
          ).catch((e) => console.error("[email] Candidate session invite failed:", e))
        );
      }

      // Lead Coach
      if (coachUser?.email) {
        invites.push(
          sendSessionInviteEmail(
            coachUser.email, coachUser.name, "Lead Coach",
            newSession, candidate.candidateName, candidate.id, allEmails
          ).catch((e) => console.error("[email] Lead Coach session invite failed:", e))
        );
      }

      // Support
      if (supportUser?.email) {
        invites.push(
          sendSessionInviteEmail(
            supportUser.email, supportUser.name, "Support",
            newSession, candidate.candidateName, candidate.id, allEmails
          ).catch((e) => console.error("[email] Support session invite failed:", e))
        );
      }

      return Promise.all(invites);
    })
    .catch((e) => console.error("[email] Session invite lookup failed:", e));

  return NextResponse.json({ candidate: updated, session: newSession });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { sessionId } = await req.json();
  const sessionToDelete = (candidate.sessions ?? []).find((s) => s.id === sessionId);

  // Remove from Google Calendar if event was created there
  if (sessionToDelete?.googleEventId) {
    deleteCalendarEvent(sessionToDelete.googleEventId).catch((err) =>
      console.error("[google-calendar] Failed to delete calendar event:", err)
    );
  }

  const sessions = (candidate.sessions ?? []).filter((s) => s.id !== sessionId);
  const updated = await updateCandidate(params.id, { sessions });
  return NextResponse.json(updated);
}
