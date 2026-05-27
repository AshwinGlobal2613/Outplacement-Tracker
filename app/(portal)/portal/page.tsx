"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users, CheckCircle2, Briefcase, TrendingUp, Clock,
  CalendarDays, ChevronRight, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SafeCandidate = {
  id: string;
  candidateName: string;
  status: string;
  leadCoach: string;
  duration: string;
  dateStarted: string | null;
  endDate: string | null;
  sessionsCompleted: number;
  newPlacement: string | null;
  position: string | null;
  newCompany: string | null;
  levelOfSupport: string;
  progress: {
    introductorySession: boolean;
    cvSessions: boolean;
    linkedinProfile: boolean;
    profiling: boolean;
    networkingPersonalBranding: boolean;
    custom?: { id: string; label: string; done: boolean }[];
  };
  sessions?: {
    id: string; title: string; date: string; time: string; type: string; duration: number;
  }[];
};

const STATUS_LABEL: Record<string, string> = {
  referred: "Referred",
  active: "Active",
  candidate_reached: "Candidate Reached",
  completed: "Completed",
  declined: "Declined",
};

const STATUS_COLOR: Record<string, string> = {
  referred: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
  active: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20",
  candidate_reached: "bg-sky-500/15 text-sky-400 ring-sky-500/20",
  completed: "bg-primary/15 text-primary ring-primary/20",
  declined: "bg-rose-500/15 text-rose-400 ring-rose-500/20",
};

function milestoneCount(p: SafeCandidate["progress"]) {
  const base = [p.introductorySession, p.cvSessions, p.linkedinProfile, p.profiling, p.networkingPersonalBranding];
  const custom = p.custom ?? [];
  const done = base.filter(Boolean).length + custom.filter((m) => m.done).length;
  const total = base.length + custom.length;
  return { done, total };
}

function getUpcomingSessions(candidates: SafeCandidate[]) {
  const today = new Date().toISOString().split("T")[0];
  return candidates
    .flatMap((c) =>
      (c.sessions ?? [])
        .filter((s) => s.date >= today)
        .map((s) => ({ ...s, candidateName: c.candidateName, candidateId: c.id }))
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function PortalPage() {
  const { data: session } = useSession();
  const [candidates, setCandidates] = useState<SafeCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/candidates")
      .then((r) => r.json())
      .then((data) => { setCandidates(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const active = candidates.filter((c) => c.status === "active" || c.status === "candidate_reached").length;
  const completed = candidates.filter((c) => c.status === "completed").length;
  const placed = candidates.filter((c) => c.status === "completed" && c.newPlacement).length;
  const placementRate = completed > 0 ? Math.round((placed / completed) * 100) : 0;
  const upcoming = getUpcomingSessions(candidates);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, <span className="text-primary">{session?.user?.clientCompany}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your outplacement programme.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-card border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Candidates" value={candidates.length} color="bg-primary/15 text-primary" />
          <StatCard icon={TrendingUp} label="Active" value={active} sub="In programme" color="bg-emerald-500/15 text-emerald-400" />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} color="bg-sky-500/15 text-sky-400" />
          <StatCard icon={Briefcase} label="Placement Rate" value={`${placementRate}%`} sub={`${placed} placed`} color="bg-amber-500/15 text-amber-400" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Candidates overview */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Candidates</h2>
            <Link href="/portal/candidates" className="flex items-center gap-1 text-xs text-primary hover:underline">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : candidates.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No candidates yet.</p>
            ) : (
              candidates.slice(0, 6).map((c) => {
                const { done, total } = milestoneCount(c.progress);
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link
                    key={c.id}
                    href={`/portal/candidates/${c.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-sidebar-accent transition-colors group"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {c.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{c.candidateName}</p>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", STATUS_COLOR[c.status] ?? "bg-muted text-muted-foreground ring-border")}>
                          {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{done}/{total}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming sessions */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-foreground">Upcoming Sessions</h2>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="px-5 py-4 space-y-1.5">
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                  <div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
                </div>
              ))
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
                <Clock className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No upcoming sessions</p>
              </div>
            ) : (
              upcoming.map((s) => {
                const d = new Date(`${s.date}T${s.time}`);
                return (
                  <div key={s.id} className="px-5 py-4">
                    <p className="text-xs font-medium text-primary">
                      {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground truncate">{s.title || s.type}</p>
                    <p className="text-xs text-muted-foreground">{s.candidateName} · {s.duration}min</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
