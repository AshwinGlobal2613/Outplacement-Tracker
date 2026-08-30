import { NextResponse } from "next/server";
import { listCalendars, isGoogleCalendarConfigured } from "@/lib/google-calendar";

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
    const calendars = await listCalendars();
    return NextResponse.json({ configured: true, calendars, error: null });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      calendars: [],
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
