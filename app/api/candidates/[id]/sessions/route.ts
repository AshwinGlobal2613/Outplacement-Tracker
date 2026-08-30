import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate, getUsers } from "@/lib/db";
import { Session } from "@/lib/types";
import { sendSessionInviteEmail, sendSessionCancellationEmail } from "@/lib/email";
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

      const googleEventId = await createCalendarEvent(newSession, candidate.candidateName, allEmails, body.calendarId);
      if (googleEventId) newSession.googleEventId = googleEventId;
    } catch (err) {
      console.error("[google-calendar] Failed to create calendar event:", err);
    }
  }

  const sessions = [...(candidate.sessions ?? []), newSession];
  const now = new Date();
  const sessionsCompleted = sessions.filter(
    (s) => new Date(`${s.date}T${s.time || "00:00"}`) < now
  ).length;
  const updated = await updateCandidate(params.id, { sessions, sessionsCompleted });

  // Fire-and-forget: send email invites
  // If the client sent an explicit inviteEmails list, use that.
  // Otherwise fall back to auto-detecting from candidate's coach/support.
  const explicitEmails: string[] | undefined = Array.isArray(body.inviteEmails) && body.inviteEmails.length > 0
    ? body.inviteEmails as string[]
    : undefined;

  getUsers()
    .then((users) => {
      // Build a name→user map with fuzzy first-name matching
      function findUser(name: string) {
        const s = name.toLowerCase().trim();
        return users.find((u) => u.name.toLowerCase() === s) ||
               users.find((u) => u.name.toLowerCase().startsWith(s + " ")) ||
               users.find((u) => u.name.toLowerCase().includes(s));
      }

      const invites: Promise<void>[] = [];

      if (explicitEmails) {
        // Use the exact list chosen by the user in the modal
        const allEmails = [...new Set(explicitEmails)];
        for (const em of allEmails) {
          // Find matching user for display name, fall back to email
          const matchedUser = users.find((u) => u.email === em || (u.additionalEmails ?? []).includes(em));
          const name = matchedUser?.name ?? em;
          const role = em === candidate.email ? "Candidate"
            : matchedUser?.name && candidate.leadCoach?.includes(matchedUser.name) ? "Lead Coach"
            : matchedUser?.name && candidate.support?.includes(matchedUser.name) ? "Support"
            : "Attendee";
          invites.push(
            sendSessionInviteEmail(em, name, role, newSession, candidate.candidateName, candidate.id, allEmails)
              .catch((e) => console.error(`[email] Invite to ${em} failed:`, e))
          );
        }
      } else {
        // Auto-detect from candidate record
        const coachNames   = candidate.leadCoach ? candidate.leadCoach.split(",").map((n) => n.trim()).filter(Boolean) : [];
        const supportNames = candidate.support    ? candidate.support.split(",").map((n) => n.trim()).filter(Boolean)    : [];

        const coachUsers   = coachNames.map(findUser).filter(Boolean);
        const supportUsers = supportNames.map(findUser).filter(Boolean);

        const coachEmails   = coachUsers.flatMap((u) => [u!.email, ...(u!.additionalEmails ?? [])]).filter(Boolean) as string[];
        const supportEmails = supportUsers.flatMap((u) => [u!.email, ...(u!.additionalEmails ?? [])]).filter(Boolean) as string[];
        const allEmails     = [...new Set([candidate.email, ...coachEmails, ...supportEmails].filter(Boolean))] as string[];

        if (candidate.email) {
          invites.push(
            sendSessionInviteEmail(candidate.email, candidate.candidateName, "Candidate", newSession, candidate.candidateName, candidate.id, allEmails)
              .catch((e) => console.error("[email] Candidate invite failed:", e))
          );
        }
        for (const u of coachUsers) {
          for (const em of [u!.email, ...(u!.additionalEmails ?? [])].filter(Boolean) as string[]) {
            invites.push(
              sendSessionInviteEmail(em, u!.name, "Lead Coach", newSession, candidate.candidateName, candidate.id, allEmails)
                .catch((e) => console.error("[email] Coach invite failed:", e))
            );
          }
        }
        for (const u of supportUsers) {
          for (const em of [u!.email, ...(u!.additionalEmails ?? [])].filter(Boolean) as string[]) {
            invites.push(
              sendSessionInviteEmail(em, u!.name, "Support", newSession, candidate.candidateName, candidate.id, allEmails)
                .catch((e) => console.error("[email] Support invite failed:", e))
            );
          }
        }
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
  const now = new Date();
  const sessionsCompleted = sessions.filter(
    (s) => new Date(`${s.date}T${s.time || "00:00"}`) < now
  ).length;
  const updated = await updateCandidate(params.id, { sessions, sessionsCompleted });

  // Fire-and-forget: send cancellation emails
  if (sessionToDelete) {
    getUsers()
      .then((users) => {
        const coachUser = candidate.leadCoach
          ? users.find((u) => u.name.trim().toLowerCase() === candidate.leadCoach.trim().toLowerCase())
          : null;
        const supportUser = candidate.support
          ? users.find((u) => u.name.trim().toLowerCase() === candidate.support.trim().toLowerCase())
          : null;

        const cancellations: Promise<void>[] = [];

        if (candidate.email) {
          cancellations.push(
            sendSessionCancellationEmail(
              candidate.email, candidate.candidateName,
              sessionToDelete, candidate.candidateName, candidate.id
            ).catch((e) => console.error("[email] Candidate cancellation failed:", e))
          );
        }
        if (coachUser?.email) {
          cancellations.push(
            sendSessionCancellationEmail(
              coachUser.email, coachUser.name,
              sessionToDelete, candidate.candidateName, candidate.id
            ).catch((e) => console.error("[email] Coach cancellation failed:", e))
          );
        }
        if (supportUser?.email) {
          cancellations.push(
            sendSessionCancellationEmail(
              supportUser.email, supportUser.name,
              sessionToDelete, candidate.candidateName, candidate.id
            ).catch((e) => console.error("[email] Support cancellation failed:", e))
          );
        }

        return Promise.all(cancellations);
      })
      .catch((e) => console.error("[email] Cancellation email lookup failed:", e));
  }

  return NextResponse.json(updated);
}
