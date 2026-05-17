"use client";

import Link from "next/link";
import { CalendarDays, Clock, MapPin, ExternalLink } from "lucide-react";
import { Candidate, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SessionWithMeta extends Session {
  candidateId: string;
  candidateName: string;
  leadCoach: string;
}

function toDateKey(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")}${ampm}`;
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function UpcomingSessionsWidget({
  candidates,
  filterByCoach,
  maxDays = 7,
}: {
  candidates: Candidate[];
  filterByCoach?: string; // if set, only show sessions where leadCoach or support includes this name
  maxDays?: number;
}) {
  const now = new Date();
  const todayKey = toDateKey(now);
  const tomorrowKey = toDateKey(new Date(now.getTime() + 86400000));
  const cutoffKey = toDateKey(new Date(now.getTime() + maxDays * 86400000));

  const sessions: SessionWithMeta[] = [];
  for (const c of candidates) {
    if (filterByCoach) {
      const fn = filterByCoach.toLowerCase();
      const coachMatch = c.leadCoach?.toLowerCase().includes(fn);
      const supportMatch = c.support?.toLowerCase().includes(fn);
      if (!coachMatch && !supportMatch) continue;
    }
    for (const s of c.sessions ?? []) {
      if (s.date < todayKey || s.date > cutoffKey) continue;
      // Skip sessions that already ended today
      if (s.date === todayKey) {
        const [h, m] = s.time.split(":").map(Number);
        const sessionEnd = new Date(now);
        sessionEnd.setHours(h, m + (s.duration ?? 0), 0, 0);
        if (sessionEnd < now) continue;
      }
      sessions.push({
        ...s,
        candidateId: c.id,
        candidateName: c.candidateName,
        leadCoach: c.leadCoach,
      });
    }
  }

  sessions.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));

  const today = sessions.filter((s) => s.date === todayKey);
  const tomorrow = sessions.filter((s) => s.date === tomorrowKey);
  const later = sessions.filter((s) => s.date > tomorrowKey);

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <WidgetHeader />
        <div className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border">
          <CalendarDays className="h-5 w-5 text-muted-foreground/40" style={{ color: "#ffffff" }} />
          <p className="text-sm text-muted-foreground">No upcoming sessions this week</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <WidgetHeader count={sessions.length} />
      <div className="space-y-4">
        {today.length > 0 && (
          <Group label="Today" accent="text-emerald-400" sessions={today} />
        )}
        {tomorrow.length > 0 && (
          <Group label="Tomorrow" accent="text-sky-400" sessions={tomorrow} />
        )}
        {later.length > 0 && (
          <Group label="Later this week" accent="text-muted-foreground" sessions={later} />
        )}
      </div>
    </div>
  );
}

function WidgetHeader({ count }: { count?: number }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
        <h2 className="font-semibold text-foreground">Upcoming Sessions</h2>
      </div>
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-bold text-primary">
          {count} this week
        </span>
      )}
    </div>
  );
}

function Group({
  label, accent, sessions,
}: {
  label: string;
  accent: string;
  sessions: SessionWithMeta[];
}) {
  return (
    <div>
      <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wider", accent)}>{label}</p>
      <div className="space-y-2">
        {sessions.map((s) => (
          <SessionCard key={`${s.candidateId}-${s.id}`} session={s} />
        ))}
      </div>
    </div>
  );
}

function SessionCard({ session: s }: { session: SessionWithMeta }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-sidebar/30 px-3 py-2.5 hover:bg-sidebar-accent transition-colors group">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{s.title}</p>
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {s.type}
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium text-foreground">{s.candidateName}</p>
        <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(s.time)} · {formatDuration(s.duration)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {s.location}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {s.meetingLink && (
          <a
            href={s.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-primary/15 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/25 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Join
          </a>
        )}
        <Link
          href={`/outplacement/candidates/${s.candidateId}`}
          className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
