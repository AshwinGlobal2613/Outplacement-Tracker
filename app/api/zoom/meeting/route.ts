import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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

  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: topic || "Coaching Session",
      type: 2,
      start_time: startTime,
      duration: duration ?? 60,
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
