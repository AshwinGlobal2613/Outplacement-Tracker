import { NextResponse } from "next/server";
import { sendSessionReminderEmail } from "@/lib/email";
import type { Session } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {

  const testSession: Session = {
    id: "test_001",
    type: "CV Session",
    title: "CV Review & Strategy Session",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    time: "10:00",
    duration: 60,
    location: "Google Meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "",
    createdAt: new Date().toISOString(),
    createdBy: "Admin",
  };

  const smtpFrom = process.env.SMTP_FROM || "(not set — defaulting to team@global-dubai.com)";

  try {
    await sendSessionReminderEmail(
      "ashwin@global-dubai.com",
      "Ashwin",
      testSession,
      "Lead Coach",
      "https://outplacement-tracker-drab.vercel.app/portal"
    );
    return NextResponse.json({
      ok: true,
      message: "Email accepted by Resend",
      from: smtpFrom,
      note: "If not received, check: 1) spam folder 2) global-dubai.com domain verification in Resend dashboard",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg, from: smtpFrom }, { status: 500 });
  }
}
