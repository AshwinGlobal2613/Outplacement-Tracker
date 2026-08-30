import { NextResponse } from "next/server";
import { google } from "googleapis";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";

export async function GET() {
  const configured = isGoogleCalendarConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? "SET" : "MISSING",
      GOOGLE_CALENDAR_ID: process.env.GOOGLE_CALENDAR_ID ?? "MISSING",
    });
  }

  try {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    const calendar = google.calendar({ version: "v3", auth: oauth2 });
    const res = await calendar.calendarList.list({ minAccessRole: "writer" });
    return NextResponse.json({ configured: true, items: res.data.items ?? [], error: null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const details = (err as { response?: { data?: unknown } })?.response?.data;
    return NextResponse.json({ configured: true, items: [], error: message, details });
  }
}
