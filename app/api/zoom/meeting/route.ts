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

interface ConflictingSession {
  candidateName: string;
  sessionTitle: string;
  date: string;
  time: string;
  duration: number;
  coach: string;
}

async function findConflictingSessions(
  startTime: string,
  duration: number
): Promise<ConflictingSession[]> {
  const requestedStart = new Date(startTime).getTime();
  const requestedEnd = requestedStart + duration * 60 * 1000;

  const candidates = await getCandidates();
  const conflicts: ConflictingSession[] = [];

  for (const candidate of candidates) {
    for (const session of candidate.sessions ?? []) {
      if (!session.date || !session.time) continue;
      const sessionStart = new Date(`${session.date}T${session.time}:00`).getTime();
      const sessionEnd = sessionStart + session.duration * 60 * 1000;

      // Overlap: requested starts before existing ends AND requested ends after existing starts
      if (requestedStart < sessionEnd && requestedEnd > sessionStart) {
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

async function sendSlackAlert(conflicts: ConflictingSession[], newSession: { topic: string; startTime: string; duration: number }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  };

  const conflictLines = conflicts.map(
    (c) =>
      `• *${c.candidateName}* — ${c.sessionTitle} at ${c.time} on ${c.date} (${c.duration} min) with ${c.coach}`
  ).join("\n");

  const message = {
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
          text: `A new Zoom link was just generated for *${newSession.topic}* at *${formatTime(newSession.startTime)}* (${newSession.duration} min), but the following session(s) overlap with that time:`,
        },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: conflictLines },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "Please review and resolve the scheduling conflict in the Outplacement Management System." }],
      },
    ],
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  }).catch(() => {/* don't block meeting creation if Slack fails */});
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "zoom_auth_failed" }, { status: 500 });

  const { topic, startTime, duration } = await req.json() as {
    topic?: string;
    startTime?: string;
    duration?: number;
  };

  const resolvedTopic = topic || "Coaching Session";
  const resolvedDuration = duration ?? 60;

  // Check for conflicts — block meeting creation if any found
  if (startTime) {
    const conflicts = await findConflictingSessions(startTime, resolvedDuration);
    if (conflicts.length > 0) {
      await sendSlackAlert(conflicts, { topic: resolvedTopic, startTime, duration: resolvedDuration });
      return NextResponse.json(
        {
          error: "scheduling_conflict",
          conflicts: conflicts.map((c) => `${c.candidateName} — ${c.sessionTitle} at ${c.time} on ${c.date}`),
        },
        { status: 409 }
      );
    }
  }

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
