import { NextRequest, NextResponse } from "next/server";
import { getCandidates, getUsers } from "@/lib/db";

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// Look up a Slack user ID by email using the bot token
async function getSlackUserId(email: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.ok ? data.user.id : null;
}

// Open a DM channel and send a message
async function sendSlackDM(slackUserId: string, message: object): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  // Open DM channel
  const dmRes = await fetch("https://slack.com/api/conversations.open", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ users: slackUserId }),
  });
  const dmData = await dmRes.json();
  if (!dmData.ok) return;

  // Send message
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

  const tomorrow = getTomorrowDate();
  const [candidates, users] = await Promise.all([getCandidates(), getUsers()]);

  // Build a name → email map from system users
  const nameToEmail: Record<string, string> = {};
  for (const u of users) {
    if (u.name && u.email) nameToEmail[u.name.toLowerCase()] = u.email;
  }

  // Collect sessions for tomorrow, grouped by person (lead coach + support)
  const sessionsByPerson: Record<string, {
    email: string;
    role: string;
    sessions: { candidateName: string; sessionTitle: string; time: string; duration: number; location: string }[];
  }> = {};

  function addSession(name: string, role: string, session: { candidateName: string; sessionTitle: string; time: string; duration: number; location: string }) {
    const email = nameToEmail[name.toLowerCase()];
    if (!email) return; // Can't DM if no matching user account
    if (!sessionsByPerson[name]) sessionsByPerson[name] = { email, role, sessions: [] };
    sessionsByPerson[name].sessions.push(session);
  }

  for (const candidate of candidates) {
    for (const s of candidate.sessions ?? []) {
      if (s.date !== tomorrow) continue;
      const sessionInfo = {
        candidateName: candidate.candidateName,
        sessionTitle: s.title,
        time: s.time,
        duration: s.duration,
        location: s.location ?? "",
      };
      if (candidate.leadCoach) {
        for (const name of candidate.leadCoach.split(",").map((n) => n.trim()).filter(Boolean)) {
          addSession(name, "Lead Coach", sessionInfo);
        }
      }
      if (candidate.support) {
        for (const name of candidate.support.split(",").map((n) => n.trim()).filter(Boolean)) {
          addSession(name, "Support", sessionInfo);
        }
      }
    }
  }

  if (Object.keys(sessionsByPerson).length === 0) {
    return NextResponse.json({ ok: true, message: "No sessions tomorrow or no matching users" });
  }

  // Send a personal DM to each person
  let dmsSent = 0;
  for (const [name, { email, sessions }] of Object.entries(sessionsByPerson)) {
    const slackUserId = await getSlackUserId(email);
    if (!slackUserId) continue;

    sessions.sort((a, b) => a.time.localeCompare(b.time));
    const lines = sessions.map((s) =>
      `• *${s.time}* — *${s.candidateName}* (${s.sessionTitle})\n  ${s.duration} min · ${s.location || "No location set"}`
    ).join("\n\n");

    await sendSlackDM(slackUserId, {
      text: `📅 You have ${sessions.length} session${sessions.length > 1 ? "s" : ""} tomorrow`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `📅 Your Sessions Tomorrow (${tomorrow})`, emoji: true },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: `Hi *${name}*, here are your sessions scheduled for tomorrow:` },
        },
        {
          type: "section",
          text: { type: "mrkdwn", text: lines },
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: "Sent by Outplacement Management System" }],
        },
      ],
    });
    dmsSent++;
  }

  return NextResponse.json({ ok: true, dmsSent });
}
