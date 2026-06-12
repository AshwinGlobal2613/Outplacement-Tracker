import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getUsers } from "@/lib/db";

export const dynamic = "force-dynamic";

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

async function getSlackUserId(email: string, token: string): Promise<string | null> {
  const res = await fetch(
    `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.ok ? data.user.id : null;
}

async function sendSlackDM(slackUserId: string, token: string, message: object): Promise<void> {
  const dmRes = await fetch("https://slack.com/api/conversations.open", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ users: slackUserId }),
  });
  const dmData = await dmRes.json();
  if (!dmData.ok) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: dmData.channel.id, ...message }),
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "SLACK_BOT_TOKEN not set" });
  }

  const now = new Date();
  // Week range: last 7 days (Mon–Sun prior to today)
  const weekEnd = new Date(now);
  weekEnd.setHours(23, 59, 59, 999);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = toDateStr(weekStart);
  const weekEndStr = toDateStr(weekEnd);

  const [candidates, users] = await Promise.all([getCandidates(), getUsers()]);

  const admins = users.filter((u) => u.role === "admin" && !u.disabled);

  // Sessions scheduled in the past 7 days
  const thisWeekSessions: { candidateName: string; sessionTitle: string; date: string; time: string; coach: string }[] = [];
  for (const c of candidates) {
    for (const s of c.sessions ?? []) {
      if (s.date >= weekStartStr && s.date <= weekEndStr) {
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

  // New candidates added this week
  const newCandidates = candidates.filter((c) => {
    const created = new Date(c.createdAt);
    return created >= weekStart && created <= weekEnd;
  });

  // Active candidates with no activity in 7+ days
  const staleCandidates = candidates
    .filter((c) => c.status === "active" || c.status === "candidate_reached")
    .filter((c) => {
      const timestamps: number[] = [];
      for (const s of c.sessions ?? []) if (s.createdAt) timestamps.push(new Date(s.createdAt).getTime());
      for (const a of c.activities ?? []) if (a.createdAt) timestamps.push(new Date(a.createdAt).getTime());
      if (timestamps.length === 0) return false;
      return daysSince(new Date(Math.max(...timestamps)).toISOString()) >= 7;
    });

  // Upcoming sessions next 7 days
  const nextWeekStart = new Date(now);
  nextWeekStart.setDate(now.getDate() + 1);
  const nextWeekEnd = new Date(now);
  nextWeekEnd.setDate(now.getDate() + 7);
  const nextWeekStartStr = toDateStr(nextWeekStart);
  const nextWeekEndStr = toDateStr(nextWeekEnd);

  const upcomingSessions: typeof thisWeekSessions = [];
  for (const c of candidates) {
    for (const s of c.sessions ?? []) {
      if (s.date >= nextWeekStartStr && s.date <= nextWeekEndStr) {
        upcomingSessions.push({
          candidateName: c.candidateName,
          sessionTitle: s.title,
          date: s.date,
          time: s.time,
          coach: c.leadCoach ?? "Unassigned",
        });
      }
    }
  }
  upcomingSessions.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const totalActive = candidates.filter((c) => c.status === "active" || c.status === "candidate_reached").length;

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `📊 Weekly Admin Update — w/c ${weekStartStr}`, emoji: true },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Active Candidates*\n${totalActive}` },
        { type: "mrkdwn", text: `*New This Week*\n${newCandidates.length}` },
        { type: "mrkdwn", text: `*Sessions (past 7 days)*\n${thisWeekSessions.length}` },
        { type: "mrkdwn", text: `*Needs Attention*\n${staleCandidates.length}` },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*📅 Sessions Last Week (${thisWeekSessions.length})*\n` +
          (thisWeekSessions.length > 0
            ? thisWeekSessions.map((s) => `• ${s.date} ${s.time} — *${s.candidateName}* (${s.sessionTitle}) — ${s.coach}`).join("\n")
            : "_No sessions last week_"),
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🗓️ Upcoming Sessions This Week (${upcomingSessions.length})*\n` +
          (upcomingSessions.length > 0
            ? upcomingSessions.map((s) => `• ${s.date} ${s.time} — *${s.candidateName}* (${s.sessionTitle}) — ${s.coach}`).join("\n")
            : "_No sessions scheduled this week_"),
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*🆕 New Candidates This Week (${newCandidates.length})*\n` +
          (newCandidates.length > 0
            ? newCandidates.map((c) => `• *${c.candidateName}* — ${c.clientName} (${c.leadCoach ?? "No coach assigned"})`).join("\n")
            : "_No new candidates added this week_"),
      },
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⚠️ Candidates Needing Attention — No Activity in 7+ Days (${staleCandidates.length})*\n` +
          (staleCandidates.length > 0
            ? staleCandidates.map((c) => `• *${c.candidateName}* — ${c.clientName} (${c.leadCoach ?? "No coach"})`).join("\n")
            : "_No stale cases — great work!_ ✅"),
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [{ type: "mrkdwn", text: "Sent every Monday at 9:00 AM by *Global Management Consultants* Outplacement Management System" }],
    },
  ];

  const message = {
    text: `📊 Weekly Admin Update — w/c ${weekStartStr}`,
    blocks,
  };

  let dmsSent = 0;
  for (const admin of admins) {
    if (!admin.email) continue;
    const slackUserId = await getSlackUserId(admin.email, token);
    if (!slackUserId) continue;
    await sendSlackDM(slackUserId, token, message);
    dmsSent++;
  }

  return NextResponse.json({
    ok: true,
    adminDmsSent: dmsSent,
    sessions: thisWeekSessions.length,
    newCandidates: newCandidates.length,
    stale: staleCandidates.length,
  });
}
