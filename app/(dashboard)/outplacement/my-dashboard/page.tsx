"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Users, Clock, CheckCircle2, XCircle, Send, UserCheck, Briefcase, CalendarDays, Users2, ExternalLink } from "lucide-react";
import { Candidate, ActivityLog } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  referred: "bg-violet-500/20 text-violet-400",
  active: "bg-emerald-500/20 text-emerald-400",
  candidate_reached: "bg-sky-500/20 text-sky-400",
  completed: "bg-blue-500/20 text-blue-400",
  declined: "bg-rose-500/20 text-rose-400",
};

const statusLabels: Record<string, string> = {
  referred: "Referred",
  active: "Active",
  candidate_reached: "Candidate Reached",
  completed: "Completed",
  declined: "Declined",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function MyDashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session === undefined) return; // wait for session to load
    Promise.all([
      fetch("/api/candidates").then((r) => r.ok ? r.json() : []).catch(() => []),
      isAdmin
        ? fetch("/api/activity").then((r) => r.ok ? r.json() : []).catch(() => [])
        : Promise.resolve([]),
    ]).then(([cands, logs]) => {
      setCandidates(Array.isArray(cands) ? cands : []);
      setActivity(Array.isArray(logs) ? logs : []);
      setLoading(false);
    });
  }, [isAdmin, session]);

  const userName = session?.user?.name ?? "";
  const firstName = userName.split(" ")[0];

  // Match candidates where user's name appears in leadCoach or support (case-insensitive)
  const myCandidates = candidates.filter((c) => {
    const coach = c.leadCoach?.toLowerCase() ?? "";
    const support = c.support?.toLowerCase() ?? "";
    const fn = firstName.toLowerCase();
    return coach.includes(fn) || support.includes(fn);
  });

  const myReferred = myCandidates.filter((c) => c.status === "referred");
  const myReached = myCandidates.filter((c) => c.status === "candidate_reached");
  const myActive = myCandidates.filter((c) => c.status === "active");
  const myCompleted = myCandidates.filter((c) => c.status === "completed");
  const myDeclined = myCandidates.filter((c) => c.status === "declined");

  const totalActivities = myCandidates.reduce((sum, c) => sum + (c.activities?.length ?? 0), 0);
  const jobOpps = myCandidates.reduce((sum, c) => sum + (c.activities?.filter((a) => a.type === "job").length ?? 0), 0);
  const events = myCandidates.reduce((sum, c) => sum + (c.activities?.filter((a) => a.type === "event").length ?? 0), 0);
  const networks = myCandidates.reduce((sum, c) => sum + (c.activities?.filter((a) => a.type === "network").length ?? 0), 0);

  const endingSoon = myCandidates.filter((c) => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    const now = new Date();
    return (
      end.getFullYear() === now.getFullYear() &&
      end.getMonth() === now.getMonth()
    );
  });

  // Filter activity logs to only ones about my candidates
  const myCandidateIds = new Set(myCandidates.map((c) => c.id));
  const myActivity = activity.filter((log) => myCandidateIds.has(log.entityId)).slice(0, 10);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`My Dashboard`}
        description={firstName ? `Welcome back, ${firstName} — ${myCandidates.length} candidates assigned to you` : "Your personal candidate view"}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={Send} color="text-violet-400" label="Referred" value={myReferred.length} />
        <StatCard icon={UserCheck} color="text-sky-400" label="Candidate Reached" value={myReached.length} />
        <StatCard icon={Users} color="text-emerald-400" label="Active" value={myActive.length} />
        <StatCard icon={CheckCircle2} color="text-blue-400" label="Completed" value={myCompleted.length} />
        <StatCard icon={XCircle} color="text-rose-400" label="Declined" value={myDeclined.length} />
      </div>

      {/* Activity breakdown */}
      {totalActivities > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <MiniPill icon={Briefcase} label="Job Opportunities" value={jobOpps} color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
          <MiniPill icon={CalendarDays} label="Events" value={events} color="text-sky-400 bg-sky-500/10 border-sky-500/20" />
          <MiniPill icon={Users2} label="Networks" value={networks} color="text-violet-400 bg-violet-500/10 border-violet-500/20" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Candidates */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">My Candidates</h2>
            <Link href="/outplacement/candidates" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {myCandidates.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No candidates matched to your name yet. Make sure your name is set as Lead Coach or Support on candidate records.
            </p>
          ) : (
            <div className="space-y-2">
              {myCandidates.slice(0, 12).map((c) => {
                const p = c.progress;
                const done = [p?.introductorySession, p?.cvSessions, p?.linkedinProfile, p?.profiling, p?.networkingPersonalBranding].filter(Boolean).length + (p?.custom ?? []).filter((m) => m.done).length;
                const totalMilestones = 5 + (p?.custom?.length ?? 0);
                const pct = totalMilestones > 0 ? Math.round((done / totalMilestones) * 100) : 0;
                return (
                  <Link key={c.id} href={`/outplacement/candidates/${c.id}`}
                    className="flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-accent group">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                      {c.candidateName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{c.candidateName}</p>
                        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", statusColors[c.status])}>
                          {statusLabels[c.status] ?? c.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.clientName} · {c.partner}</p>
                      {c.status === "active" && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground">{pct}%</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">{c.sessionsCompleted} sessions</p>
                      {c.endDate && (
                        <p className="text-[10px] text-muted-foreground">
                          Ends {new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </p>
                      )}
                      <ExternalLink className="ml-auto mt-1 h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Activity + Ending Soon */}
        <div className="space-y-4">
          {endingSoon.length > 0 && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
              <h2 className="mb-3 text-sm font-semibold text-rose-400">Ending This Month</h2>
              <div className="space-y-2">
                {endingSoon.map((c) => (
                  <Link key={c.id} href={`/outplacement/candidates/${c.id}`}
                    className="block rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 hover:bg-rose-500/20 transition-colors">
                    <p className="text-sm font-medium text-foreground">{c.candidateName}</p>
                    <p className="text-xs text-muted-foreground">
                      Ends {c.endDate ? new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBD"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
            {myActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
            ) : (
              <ul className="space-y-3">
                {myActivity.map((log) => (
                  <li key={log.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                      {(log.userName ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">{log.userName}</span>{" "}{log.action}{" "}
                        <span className="text-muted-foreground">{log.entityType}</span>
                      </p>
                      <p className="truncate text-xs font-medium text-primary">{log.entityName}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(log.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, color, label, value }: { icon: React.ElementType; color: string; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", color)} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

function MiniPill({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  const [iconCls, bgCls, borderCls] = color.split(" ");
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border p-3", bgCls, borderCls)}>
      <Icon className={cn("h-5 w-5 shrink-0", iconCls)} />
      <div>
        <p className={cn("text-lg font-bold", iconCls)}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
