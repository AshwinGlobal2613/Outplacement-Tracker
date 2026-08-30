"use client";

import { useEffect, useState } from "react";
import { X, CalendarDays, Clock, MapPin, Link2, FileDown, Check, ExternalLink, Loader2, Video, Mail } from "lucide-react";
import { Candidate, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

const RECURRENCES = [
  { label: "Does not repeat", value: "none" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Every 2 weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom…", value: "custom" },
];

const CUSTOM_UNITS = [
  { label: "days", value: "days" },
  { label: "weeks", value: "weeks" },
  { label: "months", value: "months" },
];

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

const LOCATIONS = ["Zoom", "Google Meet", "In Person"];

function formatGoogleCalendarLink(session: Session, candidate: Candidate, inviteEmails: string[]): string {
  const [year, month, day] = session.date.split("-").map(Number);
  const [hours, minutes] = session.time.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  const endDate = new Date(year, month - 1, day, hours, minutes + session.duration);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(endDate.getDate())}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;
  const allEmails = Array.from(new Set([candidate.email, ...inviteEmails].filter(Boolean)));
  const description = [
    session.meetingLink ? `Meeting Link: ${session.meetingLink}` : "",
    session.notes ? `Notes: ${session.notes}` : "",
  ].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${session.title} — ${candidate.candidateName}`,
    dates: `${startStr}/${endStr}`,
    details: description,
    location: session.meetingLink || session.location,
  });
  if (allEmails.length) params.append("add", allEmails.join(","));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function generateICS(session: Session, candidate: Candidate, inviteEmails: string[]): string {
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
  const allEmails = Array.from(new Set([candidate.email, ...inviteEmails].filter(Boolean)));
  const attendeeLines = allEmails.map((em) => `ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${em}`);
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
    ...attendeeLines,
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

/* ─── Zoom Link Generator ─── */
function ZoomLinkButton({
  date, time, duration, title,
  onLink,
}: {
  date: string; time: string; duration: number; title: string;
  onLink: (url: string) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  async function generateLink() {
    if (!date || !time) { setError("Set date and time first."); return; }
    setGenerating(true);
    setError("");
    try {
      const startTime = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("/api/zoom/meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: title, startTime, duration, date, time }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "scheduling_conflict") {
          setError("Conflict: Another session is already scheduled at this time. Your admin has been notified, please get a new link from them and paste it here.");
          return;
        }
        throw new Error(data.detail ?? data.error ?? "unknown");
      }
      onLink(data.joinUrl);
    } catch (e: unknown) {
      setError(`Failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={generateLink}
        disabled={generating}
        className="flex items-center gap-1.5 rounded-lg bg-[#2D8CFF] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a7ae8] disabled:opacity-60 transition-colors"
      >
        {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Video className="h-3.5 w-3.5" />}
        {generating ? "Generating…" : "Generate Zoom Link"}
      </button>
      {error && <p className="whitespace-pre-line text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

export function ScheduleModal({
  candidate,
  onClose,
  onSaved,
  initialSession,
  mode = "create",
}: {
  candidate: Candidate;
  onClose: () => void;
  onSaved: (session: Session) => void;
  initialSession?: Session;
  mode?: "create" | "edit";
}) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    type: initialSession?.type ?? SESSION_TYPES[0],
    title: initialSession?.title ?? SESSION_TYPES[0],
    date: initialSession?.date ?? today,
    time: initialSession?.time ?? "10:00",
    duration: initialSession?.duration ?? 60,
    location: initialSession?.location ?? "Zoom",
    meetingLink: initialSession?.meetingLink ?? "",
    notes: initialSession?.notes ?? "",
    recurrence: (initialSession?.recurrence ?? "none") as string,
    recurrenceCount: initialSession?.recurrenceCount ?? 4,
    customInterval: initialSession?.customInterval ?? 2,
    customUnit: (initialSession?.customUnit ?? "weeks") as string,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<Session | null>(null);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);

  type GCal = { id: string; summary: string; primary?: boolean };
  const [gcalConfigured, setGcalConfigured] = useState(false);
  const [gcalList, setGcalList] = useState<GCal[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState("");

  // Each recipient row: label, email, checked (included in invite), removable
  type RecipientRow = { id: string; label: string; email: string; role: string; checked: boolean; removable: boolean };
  const [inviteRows, setInviteRows] = useState<RecipientRow[]>([]);
  const [inviteRowsLoaded, setInviteRowsLoaded] = useState(false);
  const [extraEmail, setExtraEmail] = useState("");

  // Smart name lookup — handles first-name-only entries like "Ashwin" matching "Ashwin Sharma"
  function findUser(
    name: string,
    users: { name: string; email: string; additionalEmails?: string[] }[]
  ) {
    const s = name.toLowerCase().trim();
    return (
      users.find((u) => u.name.toLowerCase() === s) ||
      users.find((u) => u.name.toLowerCase().startsWith(s + " ")) ||
      users.find((u) => u.name.toLowerCase().includes(s))
    );
  }

  useEffect(() => {
    async function loadInviteRows() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) return;
        const users: { name: string; email: string; additionalEmails?: string[] }[] = await res.json();

        const rows: RecipientRow[] = [];
        let idx = 0;

        // Candidate
        if (candidate.email) {
          rows.push({ id: `r${idx++}`, label: candidate.candidateName, email: candidate.email, role: "Candidate", checked: true, removable: false });
        }

        // In edit mode pre-check exactly the stored inviteEmails; in create mode start unchecked
        const storedInvites = mode === "edit" ? (initialSession?.inviteEmails ?? null) : null;

        // Lead coaches
        const coachNames = candidate.leadCoach
          ? candidate.leadCoach.split(",").map((n) => n.trim()).filter(Boolean)
          : [];
        for (const n of coachNames) {
          const u = findUser(n, users);
          const emails = u ? [u.email, ...(u.additionalEmails ?? [])].filter(Boolean) : [];
          for (const em of emails) {
            const checked = storedInvites ? storedInvites.includes(em) : false;
            rows.push({ id: `r${idx++}`, label: u?.name ?? n, email: em, role: "Lead Coach", checked, removable: true });
          }
        }

        // Supports
        const supportNames = candidate.support
          ? candidate.support.split(",").map((n) => n.trim()).filter(Boolean)
          : [];
        for (const n of supportNames) {
          const u = findUser(n, users);
          const emails = u ? [u.email, ...(u.additionalEmails ?? [])].filter(Boolean) : [];
          for (const em of emails) {
            const checked = storedInvites ? storedInvites.includes(em) : false;
            rows.push({ id: `r${idx++}`, label: u?.name ?? n, email: em, role: "Support", checked, removable: true });
          }
        }

        // In edit mode, add any extra emails stored in inviteEmails that aren't already in rows
        if (storedInvites) {
          const existingEmails = new Set(rows.map((r) => r.email));
          for (const em of storedInvites) {
            if (!existingEmails.has(em)) {
              rows.push({ id: `r${idx++}`, label: em, email: em, role: "Additional", checked: true, removable: true });
            }
          }
        }

        setInviteRows(rows);
      } catch {
        // fetch failed — rows stay empty but we still mark loaded
      } finally {
        setInviteRowsLoaded(true);
      }
    }
    loadInviteRows();
  }, [candidate]);

  useEffect(() => {
    fetch("/api/google/calendars")
      .then((r) => r.json())
      .then((data: { configured: boolean; calendars: GCal[] }) => {
        if (data.configured && data.calendars.length) {
          setGcalConfigured(true);
          setGcalList(data.calendars);
          const primary = data.calendars.find((c) => c.primary) ?? data.calendars[0];
          setSelectedCalendarId(primary.id);
        }
      })
      .catch(() => {});
  }, []);

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
    const selectedEmails = inviteRows.filter((r) => r.checked).map((r) => r.email);
    try {
      let session: Session;
      if (mode === "edit" && initialSession) {
        const res = await fetch(`/api/candidates/${candidate.id}/sessions`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: initialSession.id,
            ...form,
            inviteEmails: selectedEmails,
            ...(gcalConfigured && selectedCalendarId ? { calendarId: selectedCalendarId } : {}),
          }),
        });
        if (!res.ok) throw new Error("Failed");
        ({ session } = await res.json());
      } else {
        const res = await fetch(`/api/candidates/${candidate.id}/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            inviteEmails: selectedEmails,
            ...(gcalConfigured && selectedCalendarId ? { calendarId: selectedCalendarId } : {}),
          }),
        });
        if (!res.ok) throw new Error("Failed");
        ({ session } = await res.json());
      }
      setSaved(session);
      setSavedEmails(selectedEmails);
      onSaved(session);
    } catch {
      alert("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" style={{ color: "#ffffff" }} />
            <div>
              <h2 className="font-semibold text-foreground">{mode === "edit" ? "Edit Session" : "Schedule Session"}</h2>
              {mode === "edit" && initialSession?.recurrenceGroupId && (
                <p className="text-[11px] text-amber-400/80 mt-0.5">Recurring series — changes apply to all sessions</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!saved ? (
          <>
          <div className="overflow-y-auto flex-1">
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
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" style={{ color: "#ffffff" }} /> Date
                  </label>
                  <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Time
                  </label>
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
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </label>
                  <select value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls}>
                    {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link2 className="h-3 w-3" /> Meeting Link
                  </label>
                  <input
                    value={form.meetingLink}
                    onChange={(e) => set("meetingLink", e.target.value)}
                    className={cn(inputCls, form.meetingLink.includes("zoom.us") && "border-[#2D8CFF]/50 bg-[#2D8CFF]/5")}
                    placeholder="https://meet.google.com/…"
                  />
                </div>
              </div>

              {/* Zoom generate button — shown when location is Zoom */}
              {form.location === "Zoom" && (
                <ZoomLinkButton
                  date={form.date}
                  time={form.time}
                  duration={form.duration}
                  title={form.title}
                  onLink={(url) => set("meetingLink", url)}
                />
              )}

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  className={inputCls + " resize-none"}
                  placeholder="Optional agenda or context…"
                />
              </div>

              {/* Recurrence */}
              {(
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Repeat</label>
                      <select value={form.recurrence} onChange={(e) => set("recurrence", e.target.value)} className={inputCls}>
                        {RECURRENCES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    {form.recurrence !== "none" && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Number of sessions</label>
                        <input
                          type="number"
                          min={2}
                          max={52}
                          value={form.recurrenceCount}
                          onChange={(e) => set("recurrenceCount", Math.max(2, Math.min(52, Number(e.target.value))))}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                  {form.recurrence === "custom" && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0">Every</span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={form.customInterval}
                        onChange={(e) => set("customInterval", Math.max(1, Math.min(99, Number(e.target.value))))}
                        className={cn(inputCls, "w-20")}
                      />
                      <select value={form.customUnit} onChange={(e) => set("customUnit", e.target.value)} className={inputCls}>
                        {CUSTOM_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                      </select>
                    </div>
                  )}
                  {form.recurrence !== "none" && (
                    <p className="text-[11px] text-muted-foreground">
                      Creates {form.recurrenceCount} sessions · Google Calendar invite will repeat {form.recurrenceCount} times
                    </p>
                  )}
                </div>
              )}

              {/* Google Calendar picker — only shown when service account is configured */}
              {gcalConfigured && gcalList.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
                      <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Send invite from calendar
                  </label>
                  <select
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                    className={inputCls}
                  >
                    {gcalList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.summary}{c.primary ? " (primary)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Editable invite recipients */}
            <div className="mx-6 mb-4 rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 bg-muted/30">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Invite will be sent to</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {inviteRows.filter((r) => r.checked).length} of {inviteRows.length} selected
                </span>
              </div>

              {/* Recipient rows with checkboxes */}
              <div className="divide-y divide-border/30 max-h-48 overflow-y-auto">
                {!inviteRowsLoaded && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">Loading recipients…</p>
                )}
                {inviteRowsLoaded && inviteRows.length === 0 && (
                  <p className="px-3 py-3 text-xs text-muted-foreground">No recipients found. Use "Add another recipient" below.</p>
                )}
                {inviteRows.map((r) => (
                  <div key={r.id} className={cn("flex items-center gap-3 px-3 py-2.5 transition-colors", !r.checked && "opacity-50")}>
                    <input
                      type="checkbox"
                      checked={r.checked}
                      disabled={!r.removable}
                      onChange={(e) => setInviteRows((prev) => prev.map((row) => row.id === r.id ? { ...row, checked: e.target.checked } : row))}
                      className="h-3.5 w-3.5 rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {r.label.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground truncate">{r.label}</p>
                        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{r.role}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{r.email}</p>
                    </div>
                    {r.removable && (
                      <button
                        type="button"
                        onClick={() => setInviteRows((prev) => prev.filter((row) => row.id !== r.id))}
                        className="shrink-0 rounded p-0.5 text-muted-foreground/30 hover:text-rose-400 transition-colors"
                        title="Remove from invite"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add extra recipient */}
              <div className="border-t border-border/60 bg-muted/30 px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Add another recipient</p>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={extraEmail}
                    onChange={(e) => setExtraEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = extraEmail.trim();
                        if (val && !inviteRows.some((r) => r.email === val)) {
                          setInviteRows((prev) => [...prev, { id: `extra_${Date.now()}`, label: val, email: val, role: "Additional", checked: true, removable: true }]);
                          setExtraEmail("");
                        }
                      }
                    }}
                    placeholder="name@example.com"
                    className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    type="button"
                    disabled={!extraEmail.trim()}
                    onClick={() => {
                      const val = extraEmail.trim();
                      if (val && !inviteRows.some((r) => r.email === val)) {
                        setInviteRows((prev) => [...prev, { id: `extra_${Date.now()}`, label: val, email: val, role: "Additional", checked: true, removable: true }]);
                        setExtraEmail("");
                      }
                    }}
                    className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

          </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4 shrink-0">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.date || !form.time || saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
                {saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Save & Get Invite"}
              </button>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="px-6 py-6 space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <Check className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-400">{mode === "edit" ? "Session updated!" : "Session saved!"}</p>
                <p className="text-xs text-muted-foreground">
                  {saved.title} · {new Date(saved.date + "T" + saved.time).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at {saved.time}
                </p>
              </div>
            </div>

            {(saved.googleEventId || (mode === "edit" && initialSession?.googleEventId)) ? (
              /* Google Calendar created the event in-system */
              <div className="rounded-xl border border-[#4285F4]/30 bg-[#4285F4]/5 px-4 py-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                      <path d="M6 2v2M18 2v2M2 8h20M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M8 13h2v2H8z" fill="#34A853" />
                      <path d="M11 13h2v2h-2z" fill="#FBBC04" />
                      <path d="M14 13h2v2h-2z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{mode === "edit" ? "Google Calendar updated" : "Added to Google Calendar"}</p>
                    <p className="text-xs text-muted-foreground">{mode === "edit" ? "Attendees notified of the changes" : "Invites sent directly — no redirect needed"}</p>
                  </div>
                  <Check className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />
                </div>
                {savedEmails.length > 0 && (
                  <p className="text-[11px] text-muted-foreground pl-12">
                    Invited: {savedEmails.join(", ")}
                  </p>
                )}
              </div>
            ) : (
              /* Fallback: Google Calendar not configured, show manual options */
              <>
                <p className="text-sm text-muted-foreground">Now add it to your calendar:</p>
                <div className="space-y-3">
                  <a
                    href={formatGoogleCalendarLink(saved, candidate, savedEmails)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-sidebar/40 px-4 py-3 text-sm hover:bg-sidebar-accent transition-colors"
                  >
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
                        <p className="text-xs text-muted-foreground">Opens pre-filled — add attendees and click Save</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </a>

                  <button
                    onClick={() => downloadICS(generateICS(saved, candidate, savedEmails), `${saved.title.replace(/\s+/g, "_")}.ics`)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-sidebar/40 px-4 py-3 text-sm hover:bg-sidebar-accent transition-colors"
                  >
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
              </>
            )}

            <button onClick={onClose} className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
