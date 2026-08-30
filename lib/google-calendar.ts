import { google } from "googleapis";
import type { Session } from "./types";

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

export async function listCalendars(): Promise<{ id: string; summary: string; primary?: boolean }[]> {
  const auth = getAuth();
  if (!auth) return [];
  try {
    const calendar = google.calendar({ version: "v3", auth });
    const res = await calendar.calendarList.list({ minAccessRole: "writer" });
    return (res.data.items ?? [])
      .map((c) => ({ id: c.id ?? "", summary: c.summary ?? c.id ?? "", primary: c.primary ?? false }))
      .filter((c) => c.id);
  } catch {
    return [];
  }
}

export async function createCalendarEvent(
  session: Session,
  candidateName: string,
  attendeeEmails: string[],
  calendarId?: string,
  recurrenceRule?: string
): Promise<string | null> {
  const auth = getAuth();
  const targetCalendarId = calendarId || process.env.GOOGLE_CALENDAR_ID;

  if (!auth || !targetCalendarId) {
    console.warn("[google-calendar] Credentials not configured — skipping calendar event creation");
    return null;
  }

  const calendar = google.calendar({ version: "v3", auth });

  const tz = process.env.GOOGLE_CALENDAR_TIMEZONE || "Asia/Dubai";
  const pad = (n: number) => String(n).padStart(2, "0");
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + session.duration;
  const endH = Math.floor(endMinutes / 60) % 24;
  const endM = endMinutes % 60;
  const endDay = day + Math.floor((hours * 60 + minutes + session.duration) / (24 * 60));

  const startStr = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;
  const endStr   = `${year}-${pad(month)}-${pad(endDay)}T${pad(endH)}:${pad(endM)}:00`;

  const description = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\n\n");

  const event = await calendar.events.insert({
    calendarId: targetCalendarId,
    sendUpdates: "all",
    requestBody: {
      summary: `${session.title} — ${candidateName}`,
      description,
      location: session.meetingLink || session.location,
      start: { dateTime: startStr, timeZone: tz },
      end:   { dateTime: endStr,   timeZone: tz },
      attendees: attendeeEmails.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 30 },
        ],
      },
      ...(recurrenceRule ? { recurrence: [recurrenceRule] } : {}),
    },
  });

  return event.data.id ?? null;
}

export async function updateCalendarEvent(
  eventId: string,
  session: Session,
  candidateName: string,
  attendeeEmails: string[],
  calendarId?: string,
  recurrenceRule?: string
): Promise<void> {
  const auth = getAuth();
  const targetCalendarId = calendarId || process.env.GOOGLE_CALENDAR_ID;
  if (!auth || !targetCalendarId) return;

  const calendar = google.calendar({ version: "v3", auth });

  const tz = process.env.GOOGLE_CALENDAR_TIMEZONE || "Asia/Dubai";
  const pad = (n: number) => String(n).padStart(2, "0");
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + session.duration;
  const endH = Math.floor(endMinutes / 60) % 24;
  const endM = endMinutes % 60;
  const endDay = day + Math.floor((hours * 60 + minutes + session.duration) / (24 * 60));

  const startStr = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;
  const endStr   = `${year}-${pad(month)}-${pad(endDay)}T${pad(endH)}:${pad(endM)}:00`;

  const description = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\n\n");

  await calendar.events.patch({
    calendarId: targetCalendarId,
    eventId,
    sendUpdates: "all",
    requestBody: {
      summary: `${session.title} — ${candidateName}`,
      description,
      location: session.meetingLink || session.location,
      start: { dateTime: startStr, timeZone: tz },
      end:   { dateTime: endStr,   timeZone: tz },
      attendees: attendeeEmails.map((email) => ({ email })),
      ...(recurrenceRule ? { recurrence: [recurrenceRule] } : {}),
    },
  });
}

export async function deleteCalendarEvent(eventId: string, calendarId?: string): Promise<void> {
  const auth = getAuth();
  const targetCalendarId = calendarId || process.env.GOOGLE_CALENDAR_ID;
  if (!auth || !targetCalendarId) return;

  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId: targetCalendarId, eventId, sendUpdates: "all" });
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_CALENDAR_ID
  );
}
