import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getCandidates } from "@/lib/db";

async function getAccessToken(): Promise<string | null> {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) return null;
  const { access_token } = await res.json();
  return access_token;
}

// Convert "HH:MM" to minutes since midnight
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

interface ConflictingSession {
  candidateName: string;
  sessionTitle: string;
  date: string;
  time: string;
  duration: number;
  coach: string;
}

async function findConflictingSessions(
  date: string,
  time: string,
  duration: number
): Promise<ConflictingSession[]> {
  const reqStart = toMinutes(time);
  const reqEnd = reqStart + duration;

  const candidates = await getCandidates();
  const conflicts: ConflictingSession[] = [];

  for (const candidate of candidates) {
    for (const session of candidate.sessions ?? []) {
      if (!session.date || !session.time) continue;
      // Only check sessions on the same date
      if (session.date !== date) continue;

      const sesStart = toMinutes(session.time);
      const sesEnd = sesStart + session.duration;

      // Overlap: req starts before session ends AND req ends after session starts
      if (reqStart < sesEnd && reqEnd > sesStart) {
        conflicts.push({
          candidateName: candidate.candidateName,
          sessionTitle: session.title,
          date: session.date,
          time: session.time,
          duration: session.duration,
          coach: candidate.leadCoach ?? "Unassigned",
        });
      }
    }
  }

  return conflicts;
}

async function sendSlackAlert(
  conflicts: ConflictingSession[],
  newSession: { topic: string; date: string; time: string; duration: number; requestedBy: string }
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const conflictLines = conflicts
    .map((c) => `• *${c.candidateName}* — ${c.sessionTitle} at ${c.time} on ${c.date} (${c.duration} min) with ${c.coach}`)
    .join("\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `:warning: *Session Scheduling Conflict Detected*`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: "⚠️ Session Scheduling Conflict", emoji: true },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${newSession.requestedBy}* requested a Zoom link for *${newSession.topic}* on *${newSession.date}* at *${newSession.time}* (${newSession.duration} min), but it conflicts with:`,
          },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: conflictLines },
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: "The Zoom link was *not* generated. Please resolve the conflict in the Outplacement Management System." }],
        },
      ],
    }),
  }).catch(() => {/* don't crash if Slack fails */});
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, startTime, duration, date, time } = await req.json() as {
    topic?: string;
    startTime?: string;
    duration?: number;
    date?: string;
    time?: string;
  };

  const resolvedTopic = topic || "Coaching Session";
  const resolvedDuration = duration ?? 60;

  // Check for conflicts using raw date/time strings (no timezone issues)
  if (date && time) {
    const conflicts = await findConflictingSessions(date, time, resolvedDuration);
    if (conflicts.length > 0) {
      const requestedBy = (token.name as string) || (token.email as string) || "Unknown user";
      await sendSlackAlert(conflicts, { topic: resolvedTopic, date, time, duration: resolvedDuration, requestedBy });
      return NextResponse.json(
        {
          error: "scheduling_conflict",
          conflicts: conflicts.map((c) => `${c.candidateName} — ${c.sessionTitle} at ${c.time} on ${c.date}`),
        },
        { status: 409 }
      );
    }
  }

  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "zoom_auth_failed" }, { status: 500 });

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: resolvedTopic,
      type: 2,
      start_time: startTime,
      duration: resolvedDuration,
      settings: {
        join_before_host: true,
        waiting_room: false,
        auto_recording: "none",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: "zoom_api_error", detail: err }, { status: 500 });
  }

  const meeting = await res.json();
  return NextResponse.json({ joinUrl: meeting.join_url, meetingId: meeting.id });
}
