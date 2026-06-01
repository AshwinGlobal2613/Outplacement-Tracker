import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getUsers } from "@/lib/db";
import { Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

// Returns the most recent session or activity date — null if none recorded yet
function getLastActionDate(c: Candidate): Date | null {
  const timestamps: number[] = [];
  for (const s of c.sessions ?? []) {
    if (s.createdAt) timestamps.push(new Date(s.createdAt).getTime());
  }
  for (const a of c.activities ?? []) {
    if (a.createdAt) timestamps.push(new Date(a.createdAt).getTime());
  }
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps));
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

  const [candidates, users] = await Promise.all([getCandidates(), getUsers()]);

  // Map user names to emails for Slack lookup
  const nameToEmail: Record<string, string> = {};
  for (const u of users) {
    if (u.name && u.email) nameToEmail[u.name.toLowerCase()] = u.email;
  }

  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Find active candidates with 7+ days no activity
  const stale = candidates
    .filter((c) => c.status === "active" || c.status === "candidate_reached")
    .map((c) => ({ candidate: c, lastAction: getLastActionDate(c) }))
    .filter(({ lastAction }) => lastAction && now - lastAction.getTime() > SEVEN_DAYS);

  if (!stale.length) {
    return NextResponse.json({ ok: true, message: "No inactive candidates found", dmsSent: 0 });
  }

  let dmsSent = 0;

  for (const { candidate: c, lastAction } of stale) {
    const daysInactive = Math.floor((now - lastAction!.getTime()) / (1000 * 60 * 60 * 24));
    const lastActionStr = lastAction!.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });

    // Collect all people to notify: lead coach + support
    const people: string[] = [
      ...(c.leadCoach ? c.leadCoach.split(",").map((n) => n.trim()).filter(Boolean) : []),
      ...(c.support    ? c.support.split(",").map((n) => n.trim()).filter(Boolean)    : []),
    ];

    const notified = new Set<string>(); // avoid duplicate DMs

    for (const name of people) {
      const email = nameToEmail[name.toLowerCase()];
      if (!email || notified.has(email)) continue;
      notified.add(email);

      const slackUserId = await getSlackUserId(email, token);
      if (!slackUserId) continue;

      await sendSlackDM(slackUserId, token, {
        text: `⚠️ ${c.candidateName} has had no activity for ${daysInactive} days`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: "⚠️ Candidate Needs Attention", emoji: true },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Hi *${name}*, a candidate on your programme has had *no activity for ${daysInactive} days* and may need a follow-up.`,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Candidate*\n${c.candidateName}` },
              { type: "mrkdwn", text: `*Client*\n${c.clientName}` },
              { type: "mrkdwn", text: `*Days Inactive*\n${daysInactive} days` },
              { type: "mrkdwn", text: `*Last Action*\n${lastActionStr}` },
            ],
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View Candidate →", emoji: true },
                style: "primary",
                url: `${process.env.NEXTAUTH_URL || "https://outplacement-tracker-drab.vercel.app"}/outplacement/candidates/${c.id}`,
              },
            ],
          },
          {
            type: "context",
            elements: [{
              type: "mrkdwn",
              text: "Sent by *Global Management Consultants* Outplacement Management System",
            }],
          },
        ],
      });

      dmsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    staleCandidates: stale.length,
    dmsSent,
  });
}
