import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid";
import { authOptions } from "@/lib/auth";
import { getCandidateById, updateCandidate, getUsers } from "@/lib/db";
import { Session } from "@/lib/types";
import { sendSessionInviteEmail, sendSessionCancellationEmail } from "@/lib/email";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, isGoogleCalendarConfigured } from "@/lib/google-calendar";

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

  const recurrence = (body.recurrence ?? "none") as string;
  const recurrenceCount = Math.max(1, Math.min(52, Number(body.recurrenceCount) || 1));
  const customInterval = Math.max(1, Math.min(99, Number(body.customInterval) || 1));
  const customUnit = (body.customUnit ?? "weeks") as "days" | "weeks" | "months";
  const recurrenceGroupId = recurrence !== "none" && recurrenceCount > 1 ? uuidv4() : undefined;

  const selectedEmails: string[] = Array.isArray(body.inviteEmails) ? body.inviteEmails as string[] : [];

  // Build the first (base) session
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
    inviteEmails: selectedEmails.length > 0 ? selectedEmails : undefined,
    ...(recurrenceGroupId ? {
      recurrence: recurrence as Session["recurrence"],
      recurrenceCount,
      recurrenceGroupId,
      ...(recurrence === "custom" ? { customInterval, customUnit } : {}),
    } : {}),
  };

  // Build all sessions (one per occurrence)
  function addOccurrenceDate(baseDate: string, recurrence: string, n: number): string {
    const [y, m, d] = baseDate.split("-").map(Number);
    const fmt = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    if (recurrence === "monthly") return fmt(new Date(y, m - 1 + n, d));
    if (recurrence === "custom") {
      if (customUnit === "months") return fmt(new Date(y, m - 1 + customInterval * n, d));
      const days = customUnit === "weeks" ? customInterval * 7 : customInterval;
      return fmt(new Date(y, m - 1, d + days * n));
    }
    const days = recurrence === "daily" ? 1 : recurrence === "weekly" ? 7 : 14;
    return fmt(new Date(y, m - 1, d + days * n));
  }

  const allNewSessions: Session[] = [newSession];
  if (recurrenceGroupId && recurrenceCount > 1) {
    for (let i = 1; i < recurrenceCount; i++) {
      allNewSessions.push({
        ...newSession,
        id: `sess_${uuidv4().slice(0, 8)}`,
        date: addOccurrenceDate(body.date, recurrence, i),
        googleEventId: undefined,
        googleCalendarId: undefined,
      });
    }
  }

  // Create Google Calendar event (recurring rule on the first session)
  let gcalInviteSent = false;
  if (isGoogleCalendarConfigured()) {
    try {
      const gcalEmails = selectedEmails.length > 0
        ? selectedEmails
        : [candidate.email].filter(Boolean) as string[];

      let rrule: string | undefined;
      if (recurrenceGroupId && recurrenceCount > 1) {
        let freq: string;
        let interval = "";
        if (recurrence === "custom") {
          freq = customUnit === "months" ? "MONTHLY" : customUnit === "days" ? "DAILY" : "WEEKLY";
          if (customInterval > 1) interval = `;INTERVAL=${customInterval}`;
        } else {
          freq = recurrence === "daily" ? "DAILY" : recurrence === "monthly" ? "MONTHLY" : "WEEKLY";
          if (recurrence === "biweekly") interval = ";INTERVAL=2";
        }
        rrule = `RRULE:FREQ=${freq}${interval};COUNT=${recurrenceCount}`;
      }

      const googleEventId = await createCalendarEvent(newSession, candidate.candidateName, gcalEmails, body.calendarId, rrule);
      if (googleEventId) {
        newSession.googleEventId = googleEventId;
        newSession.googleCalendarId = body.calendarId || process.env.GOOGLE_CALENDAR_ID;
        gcalInviteSent = true; // GCal sent its own invite via sendUpdates:"all"
      }
    } catch (err) {
      console.error("[google-calendar] Failed to create calendar event:", err);
    }
  }

  const sessions = [...(candidate.sessions ?? []), ...allNewSessions];
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
            sendSessionInviteEmail(em, name, role, newSession, candidate.candidateName, candidate.id, allEmails, gcalInviteSent)
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
            sendSessionInviteEmail(candidate.email, candidate.candidateName, "Candidate", newSession, candidate.candidateName, candidate.id, allEmails, gcalInviteSent)
              .catch((e) => console.error("[email] Candidate invite failed:", e))
          );
        }
        for (const u of coachUsers) {
          for (const em of [u!.email, ...(u!.additionalEmails ?? [])].filter(Boolean) as string[]) {
            invites.push(
              sendSessionInviteEmail(em, u!.name, "Lead Coach", newSession, candidate.candidateName, candidate.id, allEmails, gcalInviteSent)
                .catch((e) => console.error("[email] Coach invite failed:", e))
            );
          }
        }
        for (const u of supportUsers) {
          for (const em of [u!.email, ...(u!.additionalEmails ?? [])].filter(Boolean) as string[]) {
            invites.push(
              sendSessionInviteEmail(em, u!.name, "Support", newSession, candidate.candidateName, candidate.id, allEmails, gcalInviteSent)
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
    deleteCalendarEvent(sessionToDelete.googleEventId, sessionToDelete.googleCalendarId).catch((err) =>
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authSession = await getServerSession(authOptions);
  if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidate = await getCandidateById(params.id);
  if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { sessionId, ...updates } = body;

  const sessions = candidate.sessions ?? [];
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const existing = sessions[idx];

  const newRecurrence = (updates.recurrence ?? existing.recurrence ?? "none") as Session["recurrence"];
  const newCount = Math.max(1, Math.min(52, Number(updates.recurrenceCount ?? existing.recurrenceCount ?? 1)));
  const newCustomInterval = Math.max(1, Math.min(99, Number(updates.customInterval ?? existing.customInterval ?? 1)));
  const newCustomUnit = (updates.customUnit ?? existing.customUnit ?? "weeks") as "days" | "weeks" | "months";

  const updatedSession: Session = {
    ...existing,
    type: updates.type ?? existing.type,
    title: updates.title ?? existing.title,
    date: updates.date ?? existing.date,
    time: updates.time ?? existing.time,
    duration: updates.duration ?? existing.duration,
    location: updates.location ?? existing.location,
    meetingLink: updates.meetingLink ?? existing.meetingLink,
    notes: updates.notes ?? existing.notes,
    inviteEmails: Array.isArray(updates.inviteEmails) ? updates.inviteEmails as string[] : existing.inviteEmails,
    ...(newRecurrence && newRecurrence !== "none"
      ? {
          recurrence: newRecurrence,
          recurrenceCount: newCount,
          ...(newRecurrence === "custom" ? { customInterval: newCustomInterval, customUnit: newCustomUnit } : {}),
        }
      : {}),
  };

  // Helper to compute dates for recurring series
  function occurrenceDate(baseDate: string, recurrence: string, n: number, interval: number, unit: string): string {
    const [y, m, d] = baseDate.split("-").map(Number);
    const fmt = (dt: Date) =>
      `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    if (recurrence === "monthly") return fmt(new Date(y, m - 1 + n, d));
    if (recurrence === "custom") {
      if (unit === "months") return fmt(new Date(y, m - 1 + interval * n, d));
      const days = unit === "weeks" ? interval * 7 : interval;
      return fmt(new Date(y, m - 1, d + days * n));
    }
    const days = recurrence === "daily" ? 1 : recurrence === "weekly" ? 7 : 14;
    return fmt(new Date(y, m - 1, d + days * n));
  }

  // Propagate changes across the recurrence group
  const recurrenceGroupId = existing.recurrenceGroupId;
  let finalSessions: Session[];

  if (recurrenceGroupId) {
    // All sessions in this group, sorted by date
    const groupSessions = sessions
      .filter((s) => s.recurrenceGroupId === recurrenceGroupId)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

    const baseDate = groupSessions[0].date;
    const oldCount = groupSessions.length;

    // Build updated group: same non-date fields, recalculated dates
    const updatedGroup: Session[] = [];
    for (let i = 0; i < newCount; i++) {
      const date = occurrenceDate(baseDate, newRecurrence ?? "weekly", i, newCustomInterval, newCustomUnit);
      if (i < oldCount) {
        updatedGroup.push({
          ...groupSessions[i],
          type: updatedSession.type,
          title: updatedSession.title,
          time: updatedSession.time,
          duration: updatedSession.duration,
          location: updatedSession.location,
          meetingLink: updatedSession.meetingLink,
          notes: updatedSession.notes,
          inviteEmails: updatedSession.inviteEmails,
          recurrence: newRecurrence,
          recurrenceCount: newCount,
          ...(newRecurrence === "custom" ? { customInterval: newCustomInterval, customUnit: newCustomUnit } : {}),
          date,
        });
      } else {
        // New session added to the series
        updatedGroup.push({
          ...updatedSession,
          id: `sess_${uuidv4().slice(0, 8)}`,
          date,
          googleEventId: undefined,
          googleCalendarId: undefined,
        });
      }
    }
    // (sessions beyond newCount are simply not included — removed)

    const groupIds = new Set(groupSessions.map((s) => s.id));
    finalSessions = [...sessions.filter((s) => !groupIds.has(s.id)), ...updatedGroup];
    // Replace updatedSession with the one from the group that matches sessionId
    const matchInGroup = updatedGroup.find((s) => s.id === existing.id);
    if (matchInGroup) Object.assign(updatedSession, matchInGroup);
  } else {
    finalSessions = [...sessions];
    finalSessions[idx] = updatedSession;
  }

  // Sync with Google Calendar
  const gcalAttendees = (updatedSession.inviteEmails && updatedSession.inviteEmails.length > 0
    ? updatedSession.inviteEmails
    : [candidate.email]
  ).filter(Boolean) as string[];

  if (isGoogleCalendarConfigured()) {
    const targetCalendarId = (updates.calendarId as string | undefined) || updatedSession.googleCalendarId || process.env.GOOGLE_CALENDAR_ID;
    try {
      if (updatedSession.googleEventId) {
        const calendarChanged = targetCalendarId && targetCalendarId !== updatedSession.googleCalendarId;
        if (calendarChanged) {
          deleteCalendarEvent(updatedSession.googleEventId, updatedSession.googleCalendarId).catch(() => {});
          const newEventId = await createCalendarEvent(updatedSession, candidate.candidateName, gcalAttendees, targetCalendarId);
          if (newEventId) {
            updatedSession.googleEventId = newEventId;
            updatedSession.googleCalendarId = targetCalendarId;
            // Propagate new GCal IDs to the first session in group
            if (recurrenceGroupId) {
              const first = finalSessions.find((s) => s.recurrenceGroupId === recurrenceGroupId && s.id === existing.id);
              if (first) { first.googleEventId = newEventId; first.googleCalendarId = targetCalendarId; }
            }
          }
        } else {
          // Build updated RRULE if recurrence changed
          let rrule: string | undefined;
          if (recurrenceGroupId && newRecurrence && newRecurrence !== "none") {
            const freq = newRecurrence === "daily" ? "DAILY" : newRecurrence === "monthly" ? "MONTHLY" : "WEEKLY";
            const interval = newRecurrence === "biweekly" ? ";INTERVAL=2" : newRecurrence === "custom" && newCustomInterval > 1 ? `;INTERVAL=${newCustomInterval}` : "";
            rrule = `RRULE:FREQ=${freq}${interval};COUNT=${newCount}`;
          }
          await updateCalendarEvent(updatedSession.googleEventId, updatedSession, candidate.candidateName, gcalAttendees, updatedSession.googleCalendarId, rrule);
        }
      } else {
        const googleEventId = await createCalendarEvent(updatedSession, candidate.candidateName, gcalAttendees, targetCalendarId);
        if (googleEventId) {
          updatedSession.googleEventId = googleEventId;
          updatedSession.googleCalendarId = targetCalendarId;
        }
      }
    } catch (err) {
      console.error("[google-calendar] Failed to sync calendar event on edit:", err);
    }
  }

  const now = new Date();
  const sessionsCompleted = finalSessions.filter(
    (s) => new Date(`${s.date}T${s.time || "00:00"}`) < now
  ).length;
  const updated = await updateCandidate(params.id, { sessions: finalSessions, sessionsCompleted });

  // Fire-and-forget: re-send updated invite emails to exactly the stored invitees
  // gcalEditInviteSent: GCal already notified attendees via sendUpdates:"all" in updateCalendarEvent
  const gcalEditInviteSent = isGoogleCalendarConfigured() && !!updatedSession.googleEventId;
  const editInviteEmails = updatedSession.inviteEmails;
  if (editInviteEmails && editInviteEmails.length > 0) {
    getUsers()
      .then((users) => {
        const allEmails = [...new Set(editInviteEmails)];
        const invites: Promise<void>[] = [];
        for (const em of allEmails) {
          const matchedUser = users.find((u) => u.email === em || (u.additionalEmails ?? []).includes(em));
          const name = matchedUser?.name ?? em;
          const role = em === candidate.email ? "Candidate"
            : matchedUser?.name && candidate.leadCoach?.includes(matchedUser.name) ? "Lead Coach"
            : matchedUser?.name && candidate.support?.includes(matchedUser.name) ? "Support"
            : "Attendee";
          invites.push(
            sendSessionInviteEmail(em, name, role, updatedSession, candidate.candidateName, candidate.id, allEmails, gcalEditInviteSent)
              .catch((e) => console.error(`[email] Updated invite to ${em} failed:`, e))
          );
        }
        return Promise.all(invites);
      })
      .catch((e) => console.error("[email] Updated session invite lookup failed:", e));
  }

  return NextResponse.json({ candidate: updated, session: updatedSession });
}
