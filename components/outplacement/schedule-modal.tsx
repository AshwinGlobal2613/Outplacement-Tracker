"use client";

import { useState } from "react";
import { X, CalendarDays, Clock, MapPin, Link2, FileDown, ExternalLink, Check } from "lucide-react";
import { Candidate, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

const SESSION_TYPES = [
  "Introductory Session",
  "CV Session",
  "LinkedIn & Profile",
  "Profiling (DiSC)",
  "Networking & Personal Branding",
  "Follow-up",
  "Check-in",
  "Custom",
];

const DURATIONS = [
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
];

const LOCATIONS = ["Google Meet", "In Person", "Phone Call", "Zoom", "Microsoft Teams", "Other"];

function formatGoogleCalendarLink(session: Session, candidate: Candidate): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);

  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;

  const endDate = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const attendees = [candidate.email].filter(Boolean).join(",");
  const description =
    `Candidate: ${candidate.candidateName}` +
    (candidate.leadCoach ? `\nLead Coach: ${candidate.leadCoach}` : "") +
    (candidate.support ? `\nSupport: ${candidate.support}` : "") +
    (session.meetingLink ? `\nMeeting Link: ${session.meetingLink}` : "") +
    (session.notes ? `\n\nNotes: ${session.notes}` : "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${session.title} — ${candidate.candidateName}`,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: session.meetingLink || session.location,
  });
  if (attendees) params.append("add", attendees);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICS(session: Session, candidate: Candidate): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const description =
    `Candidate: ${candidate.candidateName}` +
    (candidate.leadCoach ? `\\nLead Coach: ${candidate.leadCoach}` : "") +
    (candidate.support ? `\\nSupport: ${candidate.support}` : "") +
    (session.notes ? `\\n\\nNotes: ${session.notes}` : "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Global Management Consultants//OMS//EN",
    "BEGIN:VEVENT",
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${session.title} — ${candidate.candidateName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${session.meetingLink || session.location}`,
    candidate.email ? `ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${candidate.email}` : "",
    `UID:${session.id}@gmc-oms`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}

function downloadICS(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function ScheduleModal({
  candidate,
  onClose,
  onSaved,
}: {
  candidate: Candidate;
  onClose: () => void;
  onSaved: (session: Session) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: SESSION_TYPES[0],
    title: SESSION_TYPES[0],
    date: today,
    time: "10:00",
    duration: 60,
    location: "Google Meet",
    meetingLink: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Session | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "type" && prev.title === prev.type) next.title = value as string;
      return next;
    });
  }

  async function handleSave() {
    if (!form.date || !form.time) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      const { session } = await res.json();
      setSaved(session);
      onSaved(session);
    } catch {
      alert("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Schedule Session</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!saved ? (
          <>
            <div className="space-y-4 px-6 py-5">
              {/* Candidate info */}
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Candidate</p>
                <p className="font-medium text-foreground">{candidate.candidateName}</p>
                {candidate.leadCoach && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Coach: {candidate.leadCoach}
                    {candidate.support ? ` · Support: ${candidate.support}` : ""}
                  </p>
                )}
              </div>

              {/* Session type + title */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Session Type</label>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                    {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Title</label>
                  <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="Session title" />
                </div>
              </div>

              {/* Date + Time + Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Date</label>
                  <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Time</label>
                  <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Duration</label>
                  <select value={form.duration} onChange={(e) => set("duration", Number(e.target.value))} className={inputCls}>
                    {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Location + Meeting Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</label>
                  <select value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls}>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1"><Link2 className="h-3 w-3" /> Meeting Link</label>
                  <input value={form.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} className={inputCls} placeholder="https://meet.google.com/…" />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputCls + " resize-none"} placeholder="Optional agenda or context…" />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!form.date || !form.time || saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
                <CalendarDays className="h-4 w-4" />
                {saving ? "Saving…" : "Save & Get Invite"}
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="px-6 py-6 space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-400">Session saved!</p>
                <p className="text-xs text-muted-foreground">
                  {saved.title} · {new Date(saved.date + "T" + saved.time).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at {saved.time}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Now add it to your calendar:</p>

            <div className="space-y-3">
              <a href={formatGoogleCalendarLink(saved, candidate)} target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-sidebar/40 px-4 py-3 text-sm hover:bg-sidebar-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M8 13h2v2H8z" fill="#34A853" />
                      <path d="M11 13h2v2h-2z" fill="#FBBC04" />
                      <path d="M14 13h2v2h-2z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Open in Google Calendar</p>
                    <p className="text-xs text-muted-foreground">Opens pre-filled — just click Save</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </a>

              <button onClick={() => downloadICS(generateICS(saved, candidate), `${saved.title.replace(/\s+/g, "_")}.ics`)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-sidebar/40 px-4 py-3 text-sm hover:bg-sidebar-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <FileDown className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Download .ics file</p>
                    <p className="text-xs text-muted-foreground">Works with Outlook, Apple Calendar & others</p>
                  </div>
                </div>
              </button>
            </div>

            <button onClick={onClose} className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
