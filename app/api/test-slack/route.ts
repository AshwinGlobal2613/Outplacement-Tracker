import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getSlackUserId(email: string): Promise<string | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return null;
  const res = await fetch(
    `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.ok ? data.user.id : null;
}

async function sendSlackDM(slackUserId: string, message: object): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return { ok: false, error: "SLACK_BOT_TOKEN not set" };

  const dmRes = await fetch("https://slack.com/api/conversations.open", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ users: slackUserId }),
  });
  const dmData = await dmRes.json();
  if (!dmData.ok) return { ok: false, error: `conversations.open failed: ${dmData.error}` };

  const msgRes = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ channel: dmData.channel.id, ...message }),
  });
  const msgData = await msgRes.json();
  return { ok: msgData.ok, error: msgData.error };
}

export async function GET() {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "SLACK_BOT_TOKEN not set in environment" });
  }

  const testEmail = "ashwin@global-dubai.com";
  const slackUserId = await getSlackUserId(testEmail);

  if (!slackUserId) {
    return NextResponse.json({
      ok: false,
      error: `Could not find Slack user for ${testEmail}. Make sure this email is registered in your Slack workspace.`,
    });
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const result = await sendSlackDM(slackUserId, {
    text: "📅 You have 1 session tomorrow",
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📅 Session Reminder — ${tomorrow}`, emoji: true },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Hi *Ashwin*, this is a test reminder from the Outplacement Management System.\n\nYou have the following session scheduled for tomorrow:`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `• *10:00* — *Test Candidate* (CV Review & Strategy Session)\n  60 min · Google Meet`,
        },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: "Sent by *Global Management Consultants* Outplacement Management System" }],
      },
    ],
  });

  return NextResponse.json({
    ok: result.ok,
    slackUserId,
    email: testEmail,
    error: result.error ?? null,
    message: result.ok ? "Slack DM sent successfully" : "Slack DM failed",
  });
}
