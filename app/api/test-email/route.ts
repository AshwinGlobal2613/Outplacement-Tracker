import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSessionReminderEmail } from "@/lib/email";
import type { Session } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  try {
    await sendSessionReminderEmail(
      "ashwin@global-dubai.com",
      "Ashwin",
      testSession,
      "Lead Coach",
      "https://outplacement-tracker-drab.vercel.app/portal"
    );
    return NextResponse.json({ ok: true, message: "Test reminder email sent to ashwin@global-dubai.com" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
