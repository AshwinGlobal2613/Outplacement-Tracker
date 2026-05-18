import { NextRequest, NextResponse } from "next/server";
import { getCandidates } from "@/lib/db";

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

async function sendSlack(message: object) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
}

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = getTomorrowDate();
  const candidates = await getCandidates();

  const upcomingSessions: {
    candidateName: string;
    sessionTitle: string;
    time: string;
    duration: number;
    location: string;
    leadCoach: string;
    support: string;
  }[] = [];

  for (const candidate of candidates) {
    for (const session of candidate.sessions ?? []) {
      if (session.date === tomorrow) {
        upcomingSessions.push({
          candidateName: candidate.candidateName,
          sessionTitle: session.title,
          time: session.time,
          duration: session.duration,
          location: session.location ?? "",
          leadCoach: candidate.leadCoach ?? "Unassigned",
          support: candidate.support ?? "",
        });
      }
    }
  }

  if (upcomingSessions.length === 0) {
    return NextResponse.json({ ok: true, message: "No sessions tomorrow" });
  }

  // Sort by time
  upcomingSessions.sort((a, b) => a.time.localeCompare(b.time));

  const sessionLines = upcomingSessions.map((s) => {
    const parts = [`• *${s.time}* — *${s.candidateName}* (${s.sessionTitle})`];
    parts.push(`  ${s.duration} min · ${s.location || "No location set"}`);
    parts.push(`  Lead: ${s.leadCoach}${s.support ? ` · Support: ${s.support}` : ""}`);
    return parts.join("\n");
  }).join("\n\n");

  await sendSlack({
    text: `:calendar: *${upcomingSessions.length} session${upcomingSessions.length > 1 ? "s" : ""} scheduled for tomorrow*`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📅 Tomorrow's Sessions (${tomorrow})`, emoji: true },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: sessionLines },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "Sent by Outplacement Management System · Session Reminders" }],
      },
    ],
  });

  return NextResponse.json({ ok: true, sent: upcomingSessions.length });
}
