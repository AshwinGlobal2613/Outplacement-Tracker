"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Users, CheckCircle2, XCircle, Activity, Clock } from "lucide-react";
import { Candidate, ActivityLog } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusColors: Record<string, string> = {
  referred: "bg-violet-500/20 text-violet-400",
  active: "bg-emerald-500/20 text-emerald-400",
  candidate_reached: "bg-sky-500/20 text-sky-400",
  completed: "bg-blue-500/20 text-blue-400",
  declined: "bg-rose-500/20 text-rose-400",
};

export default function OutplacementOverview() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetches: Promise<unknown>[] = [
      fetch("/api/candidates").then((r) => r.json()),
      isAdmin ? fetch("/api/activity").then((r) => r.json()) : Promise.resolve([]),
    ];
    Promise.all(fetches).then(([cands, logs]) => {
      setCandidates(Array.isArray(cands) ? cands : []);
      setActivity(Array.isArray(logs) ? logs : []);
      setLoading(false);
    });
  }, [isAdmin]);

  const active = candidates.filter((c) => c.status === "active");
  const completed = candidates.filter((c) => c.status === "completed");
  const declined = candidates.filter((c) => c.status === "declined");

  const dueThisMonth = active.filter((c) => {
    if (!c.endDate) return false;
    const end = new Date(c.endDate);
    const now = new Date();
    return end.getFullYear() === now.getFullYear() && end.getMonth() === now.getMonth();
  });

  const placed = completed.filter((c) => c.jobStatus === "Y").length;

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
        title="Outplacement Overview"
        description="Track all candidate programs, job transitions, and placements."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Active Programs"
          value={active.length.toString()}
          change="currently running"
          positive
          icon={Users}
          iconColor="text-emerald-400"
        />
        <StatCard
          title="Declined"
          value={declined.length.toString()}
          change="did not proceed"
          positive={false}
          icon={XCircle}
          iconColor="text-rose-400"
        />
        <StatCard
          title="Completed"
          value={completed.length.toString()}
          change={`${placed} placed`}
          positive
          icon={CheckCircle2}
          iconColor="text-blue-400"
        />
        <StatCard
          title="Ending This Month"
          value={dueThisMonth.length.toString()}
          change="programs expiring"
          positive={dueThisMonth.length === 0}
          icon={Clock}
          iconColor="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Candidates */}
        <div className="col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Active Candidates</h2>
            <Link href="/outplacement/candidates" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {active.slice(0, 8).map((c) => {
              const progressCount = Object.values(c.progress).filter(Boolean).length;
              const pct = Math.round((progressCount / 5) * 100);
              return (
                <Link
                  key={c.id}
                  href={`/outplacement/candidates/${c.id}`}
                  className="flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-accent"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {c.candidateName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{c.candidateName}</p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", statusColors[c.status])}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.clientName} · {c.leadCoach}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{pct}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{c.sessionsCompleted} sessions</p>
                    {c.endDate && (
                      <p className="text-[10px] text-muted-foreground">
                        Ends {new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
            {active.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No active candidates</p>
            )}
          </div>
        </div>

      </div>

      {/* Ending Soon */}
      {dueThisMonth.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
          <h2 className="mb-3 font-semibold text-rose-400">⚠ Programs Ending This Month</h2>
          <div className="flex flex-wrap gap-3">
            {dueThisMonth.map((c) => (
              <Link
                key={c.id}
                href={`/outplacement/candidates/${c.id}`}
                className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm hover:bg-rose-500/20 transition-colors"
              >
                <p className="font-medium text-foreground">{c.candidateName}</p>
                <p className="text-xs text-muted-foreground">
                  Ends {c.endDate ? new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "TBD"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
