import { NextRequest, NextResponse } from "next/server";
import { getCandidates } from "@/lib/db";

function getWeekRange() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { startOfWeek, endOfWeek } = getWeekRange();
  const weekStart = toDateStr(startOfWeek);
  const weekEnd = toDateStr(endOfWeek);
  const candidates = await getCandidates();

  // Sessions this week
  const thisWeekSessions: { candidateName: string; sessionTitle: string; date: string; time: string; coach: string }[] = [];
  for (const c of candidates) {
    for (const s of c.sessions ?? []) {
      if (s.date >= weekStart && s.date <= weekEnd) {
        thisWeekSessions.push({
          candidateName: c.candidateName,
          sessionTitle: s.title,
          date: s.date,
          time: s.time,
          coach: c.leadCoach ?? "Unassigned",
        });
      }
    }
  }
  thisWeekSessions.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  // New candidates this week
  const newCandidates = candidates.filter((c) => {
    const created = new Date(c.createdAt);
    return created >= startOfWeek && created <= endOfWeek;
  });

  // Stale cases (active/candidate_reached with no session/activity in 7+ days)
  const staleCandidates = candidates
    .filter((c) => c.status === "active" || c.status === "candidate_reached")
    .filter((c) => {
      const timestamps: number[] = [];
      for (const s of c.sessions ?? []) if (s.createdAt) timestamps.push(new Date(s.createdAt).getTime());
      for (const a of c.activities ?? []) if (a.createdAt) timestamps.push(new Date(a.createdAt).getTime());
      if (timestamps.length === 0) return false;
      const lastAction = new Date(Math.max(...timestamps));
      return daysSince(lastAction.toISOString()) >= 7;
    });

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `📊 Weekly Digest — ${weekStart} to ${weekEnd}`, emoji: true },
    },
    { type: "divider" },
    // Sessions
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📅 Sessions This Week (${thisWeekSessions.length})*\n` +
          (thisWeekSessions.length > 0
            ? thisWeekSessions.map((s) => `• ${s.date} ${s.time} — *${s.candidateName}* (${s.sessionTitle}) with ${s.coach}`).join("\n")
            : "_No sessions scheduled this week_"),
      },
    },
    { type: "divider" },
    // New candidates
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🆕 New Candidates This Week (${newCandidates.length})*\n` +
          (newCandidates.length > 0
            ? newCandidates.map((c) => `• *${c.candidateName}* — ${c.clientName} (${c.leadCoach ?? "No coach"})`).join("\n")
            : "_No new candidates added this week_"),
      },
    },
    { type: "divider" },
    // Stale cases
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⚠️ Stale Cases — No Activity in 7+ Days (${staleCandidates.length})*\n` +
          (staleCandidates.length > 0
            ? staleCandidates.map((c) => `• *${c.candidateName}* — ${c.leadCoach ?? "No coach"}`).join("\n")
            : "_No stale cases — great work!_ ✅"),
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "Sent every Monday by the Outplacement Management System" }],
    },
  ];

  await sendSlack({
    text: `📊 Weekly OMS Digest — ${weekStart} to ${weekEnd}`,
    blocks,
  });

  return NextResponse.json({ ok: true, sessions: thisWeekSessions.length, newCandidates: newCandidates.length, stale: staleCandidates.length });
}
