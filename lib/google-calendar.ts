import { google } from "googleapis";
import type { Session } from "./types";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) return null;

  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function createCalendarEvent(
  session: Session,
  candidateName: string,
  attendeeEmails: string[]
): Promise<string | null> {
  const auth = getAuth();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!auth || !calendarId) {
    console.warn("[google-calendar] Credentials not configured — skipping calendar event creation");
    return null;
  }

  const calendar = google.calendar({ version: "v3", auth });

  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);

  const startDateTime = new Date(year, month - 1, day, hours, minutes);
  const endDateTime = new Date(startDateTime.getTime() + session.duration * 60 * 1000);

  const description = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\n\n");

  const event = await calendar.events.insert({
    calendarId,
    sendUpdates: "all",       // Google sends invites to all attendees
    requestBody: {
      summary: `${session.title} — ${candidateName}`,
      description,
      location: session.meetingLink || session.location,
      start: { dateTime: startDateTime.toISOString() },
      end:   { dateTime: endDateTime.toISOString() },
      attendees: attendeeEmails.map((email) => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },   // 1 day before
          { method: "popup", minutes: 30 },         // 30 min before
        ],
      },
    },
  });

  return event.data.id ?? null;
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = getAuth();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!auth || !calendarId) return;

  const calendar = google.calendar({ version: "v3", auth });
  await calendar.events.delete({ calendarId, eventId, sendUpdates: "all" });
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );
}
