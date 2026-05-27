"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Circle, CalendarDays, Clock,
  Briefcase, User, Link2, MapPin, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SafeCandidate = {
  id: string;
  candidateName: string;
  status: string;
  leadCoach: string;
  support: string;
  levelOfSupport: string;
  duration: string;
  dateStarted: string | null;
  endDate: string | null;
  sessionsCompleted: number;
  email: string;
  linkedin: string;
  newPlacement: string | null;
  newCompany: string | null;
  position: string | null;
  sector: string | null;
  jobStatus: string | null;
  oldPlacement: string | null;
  progress: {
    introductorySession: boolean;
    cvSessions: boolean;
    linkedinProfile: boolean;
    profiling: boolean;
    networkingPersonalBranding: boolean;
    custom?: { id: string; label: string; done: boolean; notes?: string }[];
  };
  sessions?: {
    id: string; type: string; title: string; date: string; time: string;
    duration: number; location: string; meetingLink: string; notes: string;
  }[];
  activities?: {
    id: string; type: string; title: string; link: string; notes: string; createdAt: string;
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  referred: "Referred", active: "Active", candidate_reached: "Candidate Reached",
  completed: "Completed", declined: "Declined",
};
const STATUS_COLOR: Record<string, string> = {
  referred: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  active: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  candidate_reached: "bg-sky-500/15 text-sky-400 ring-sky-500/20",
  completed: "bg-primary/15 text-primary ring-primary/20",
  declined: "bg-rose-500/15 text-rose-400 ring-rose-500/20",
};

const MILESTONE_KEYS = [
  { key: "introductorySession", label: "Introductory Session" },
  { key: "cvSessions", label: "CV Sessions" },
  { key: "linkedinProfile", label: "LinkedIn Profile" },
  { key: "profiling", label: "Profiling" },
  { key: "networkingPersonalBranding", label: "Networking & Personal Branding" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function PortalCandidatePage() {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<SafeCandidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/portal/candidates/${id}`)
      .then((r) => r.json())
      .then((data) => { setCandidate(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
  if (!candidate) return (
    <div className="py-20 text-center text-muted-foreground">Candidate not found.</div>
  );

  const today = new Date().toISOString().split("T")[0];
  const upcomingSessions = (candidate.sessions ?? []).filter((s) => s.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const pastSessions = (candidate.sessions ?? []).filter((s) => s.date < today).sort((a, b) => b.date.localeCompare(a.date));

  const baseMilestoneDone = [
    candidate.progress.introductorySession, candidate.progress.cvSessions,
    candidate.progress.linkedinProfile, candidate.progress.profiling,
    candidate.progress.networkingPersonalBranding,
  ].filter(Boolean).length;
  const customMilestones = candidate.progress.custom ?? [];
  const totalDone = baseMilestoneDone + customMilestones.filter((m) => m.done).length;
  const totalMilestones = 5 + customMilestones.length;
  const pct = totalMilestones > 0 ? Math.round((totalDone / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/portal/candidates" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Candidates
      </Link>

      {/* Hero card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
              {candidate.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{candidate.candidateName}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {candidate.oldPlacement && <span>{candidate.oldPlacement}</span>}
                {candidate.sector && <><span>·</span><span>{candidate.sector}</span></>}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium ring-1", STATUS_COLOR[candidate.status] ?? "bg-muted text-muted-foreground ring-border")}>
                  {STATUS_LABEL[candidate.status] ?? candidate.status}
                </span>
                {candidate.levelOfSupport && (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    <Star className="h-3 w-3" /> {candidate.levelOfSupport} support
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Programme meta */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:text-right text-sm">
            {candidate.leadCoach && (
              <div className="sm:col-span-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Lead Coach</p>
                <p className="font-medium text-foreground">{candidate.leadCoach}</p>
              </div>
            )}
            {candidate.duration && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Programme</p>
                <p className="font-medium text-foreground">{candidate.duration}</p>
              </div>
            )}
            {candidate.dateStarted && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Started</p>
                <p className="font-medium text-foreground">{fmt(candidate.dateStarted)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Milestones + placement */}
        <div className="space-y-6 lg:col-span-2">
          {/* Milestones */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Programme Milestones</h2>
              <span className="text-sm font-medium text-muted-foreground">{pct}% complete</span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-3">
              {MILESTONE_KEYS.map(({ key, label }) => {
                const done = candidate.progress[key as keyof typeof candidate.progress] as boolean;
                return (
                  <div key={key} className="flex items-center gap-3">
                    {done
                      ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />}
                    <span className={cn("text-sm", done ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                    {done && <span className="ml-auto text-xs text-emerald-400">Completed</span>}
                  </div>
                );
              })}
              {customMilestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  {m.done
                    ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/30" />}
                  <span className={cn("text-sm", m.done ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
                  {m.done && <span className="ml-auto text-xs text-emerald-400">Completed</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Placement outcome */}
          {candidate.status === "completed" && (candidate.newPlacement || candidate.position) && (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                <h2 className="font-semibold text-emerald-400">Placement Outcome</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {candidate.newPlacement && (
                  <div>
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wide">Company</p>
                    <p className="text-sm font-medium text-foreground">{candidate.newPlacement}</p>
                  </div>
                )}
                {candidate.position && (
                  <div>
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wide">Role</p>
                    <p className="text-sm font-medium text-foreground">{candidate.position}</p>
                  </div>
                )}
                {candidate.sector && (
                  <div>
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wide">Sector</p>
                    <p className="text-sm font-medium text-foreground">{candidate.sector}</p>
                  </div>
                )}
                {candidate.jobStatus && (
                  <div>
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wide">Status</p>
                    <p className="text-sm font-medium text-foreground">{candidate.jobStatus}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activities */}
          {(candidate.activities ?? []).length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-semibold text-foreground">Job Search Activity</h2>
              <div className="space-y-3">
                {(candidate.activities ?? []).slice(0, 8).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase",
                      a.type === "job" ? "bg-primary/15 text-primary" :
                      a.type === "event" ? "bg-amber-500/15 text-amber-400" :
                      "bg-sky-500/15 text-sky-400"
                    )}>
                      {a.type[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                      {a.notes && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.notes}</p>}
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        {new Date(a.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 text-muted-foreground/40 hover:text-primary transition-colors">
                        <Link2 className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sessions */}
        <div className="space-y-4">
          {/* Upcoming */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Upcoming Sessions</h2>
            </div>
            <div className="divide-y divide-border">
              {upcomingSessions.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">No upcoming sessions</p>
              ) : upcomingSessions.map((s) => {
                const d = new Date(`${s.date}T${s.time}`);
                return (
                  <div key={s.id} className="px-4 py-3">
                    <p className="text-xs font-semibold text-primary">
                      {d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{s.title || s.type}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration}min</span>
                      {s.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{s.location}</span>}
                    </div>
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <Link2 className="h-3 w-3" /> Join meeting
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session summary */}
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Session Summary</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total completed</span>
                <span className="font-semibold text-foreground">{candidate.sessionsCompleted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upcoming</span>
                <span className="font-semibold text-foreground">{upcomingSessions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Past (logged)</span>
                <span className="font-semibold text-foreground">{pastSessions.length}</span>
              </div>
            </div>
          </div>

          {/* Past sessions */}
          {pastSessions.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Past Sessions</h2>
              </div>
              <div className="divide-y divide-border">
                {pastSessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">{fmt(s.date)}</p>
                    <p className="mt-0.5 text-sm text-foreground">{s.title || s.type}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
