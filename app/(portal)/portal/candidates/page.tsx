"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CheckCircle2, Circle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type SafeCandidate = {
  id: string;
  candidateName: string;
  status: string;
  leadCoach: string;
  support: string;
  duration: string;
  dateStarted: string | null;
  endDate: string | null;
  sessionsCompleted: number;
  levelOfSupport: string;
  newPlacement: string | null;
  position: string | null;
  newCompany: string | null;
  progress: {
    introductorySession: boolean;
    cvSessions: boolean;
    linkedinProfile: boolean;
    profiling: boolean;
    networkingPersonalBranding: boolean;
    custom?: { id: string; label: string; done: boolean }[];
  };
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

const MILESTONE_LABELS = [
  { key: "introductorySession", label: "Introductory Session" },
  { key: "cvSessions", label: "CV Sessions" },
  { key: "linkedinProfile", label: "LinkedIn Profile" },
  { key: "profiling", label: "Profiling" },
  { key: "networkingPersonalBranding", label: "Networking & Personal Branding" },
];

function milestoneCount(p: SafeCandidate["progress"]) {
  const base = [p.introductorySession, p.cvSessions, p.linkedinProfile, p.profiling, p.networkingPersonalBranding];
  const custom = p.custom ?? [];
  const done = base.filter(Boolean).length + custom.filter((m) => m.done).length;
  const total = base.length + custom.length;
  return { done, total };
}

export default function PortalCandidatesPage() {
  const [candidates, setCandidates] = useState<SafeCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/portal/candidates")
      .then((r) => r.json())
      .then((data) => { setCandidates(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = candidates.filter((c) => {
    const matchSearch = c.candidateName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidates</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in your programme
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates…"
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Candidate cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No candidates found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((c) => {
            const { done, total } = milestoneCount(c.progress);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Link
                key={c.id}
                href={`/portal/candidates/${c.id}`}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-sidebar-accent transition-all"
              >
                {/* Name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {c.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{c.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{c.leadCoach || "—"}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium ring-1", STATUS_COLOR[c.status] ?? "bg-muted text-muted-foreground ring-border")}>
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Programme info */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {c.duration && <span>Duration: <span className="text-foreground">{c.duration}</span></span>}
                  {c.dateStarted && <span>Started: <span className="text-foreground">{new Date(c.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></span>}
                  {c.sessionsCompleted > 0 && <span>Sessions: <span className="text-foreground">{c.sessionsCompleted}</span></span>}
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Milestone Progress</span>
                    <span className="font-medium text-foreground">{done}/{total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Milestones checklist (condensed) */}
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
                  {MILESTONE_LABELS.map(({ key, label }) => {
                    const done = c.progress[key as keyof typeof c.progress] as boolean;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        {done
                          ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
                          : <Circle className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
                        <span className={cn("truncate text-[11px]", done ? "text-foreground" : "text-muted-foreground/60")}>{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Placement (if completed) */}
                {c.status === "completed" && c.newPlacement && (
                  <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                    <p className="text-xs font-medium text-emerald-400">✓ Placed at {c.newPlacement}</p>
                    {c.position && <p className="text-[11px] text-emerald-400/70">{c.position}</p>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
