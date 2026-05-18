import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getZoomTokens, saveZoomTokens, deleteZoomTokens } from "@/lib/db";

async function getValidAccessToken(userId: string): Promise<string | null> {
  const tokens = await getZoomTokens(userId);
  if (!tokens) return null;

  // Still valid with >5 min remaining
  if (new Date(tokens.expiresAt).getTime() - Date.now() > 5 * 60 * 1000) {
    return tokens.accessToken;
  }

  // Refresh
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    }),
  });

  if (!res.ok) {
    await deleteZoomTokens(userId);
    return null;
  }

  const { access_token, refresh_token, expires_in } = await res.json();
  await saveZoomTokens({
    userId,
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
  });
  return access_token;
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || "outplacement-tracker-secret-key-2026" });
  if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = await getValidAccessToken(token.id as string);
  if (!accessToken) return NextResponse.json({ error: "not_connected" }, { status: 401 });

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
