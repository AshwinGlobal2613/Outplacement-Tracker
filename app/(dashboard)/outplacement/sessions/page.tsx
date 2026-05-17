"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Candidate, Session } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SessionWithCandidate extends Session {
  candidateId: string;
  candidateName: string;
  leadCoach: string;
  support: string;
}

export default function SessionsPage() {
  const { data: authSession } = useSession();
  const isAdmin = authSession?.user?.role === "admin";
  const [allSessions, setAllSessions] = useState<SessionWithCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.ok ? r.json() : [])
      .catch(() => [])
      .then((candidates: Candidate[]) => {
        const flat: SessionWithCandidate[] = [];
        for (const c of candidates) {
          for (const s of c.sessions ?? []) {
            flat.push({
              ...s,
              candidateId: c.id,
              candidateName: c.candidateName,
              leadCoach: c.leadCoach,
              support: c.support,
            });
          }
        }
        flat.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
        setAllSessions(flat);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const upcoming = allSessions.filter((s) => new Date(`${s.date}T${s.time}`) >= now);
  const past = allSessions.filter((s) => new Date(`${s.date}T${s.time}`) < now).reverse();
  const displayed = tab === "upcoming" ? upcoming : past;

  function formatDate(date: string, time: string) {
    return new Date(`${date}T${time}`).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  }

  function formatDuration(mins: number) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Sessions"
        description="All scheduled coaching sessions across candidates"
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1 w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors capitalize",
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {t}
            <span className={cn("ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              tab === t ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
              {t === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border">
          <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {tab === "upcoming" ? "No upcoming sessions scheduled." : "No past sessions."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((s) => (
            <Link key={`${s.candidateId}-${s.id}`} href={`/outplacement/candidates/${s.candidateId}`}
              className="block rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-sidebar-accent group">
              <div className="flex items-start gap-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  tab === "upcoming" ? "bg-primary/15" : "bg-muted")}>
                  <CalendarDays className={cn("h-5 w-5", tab === "upcoming" ? "text-primary" : "text-muted-foreground")} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-foreground">{s.title}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      tab === "upcoming" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                      {s.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Users className="h-3.5 w-3.5" /> {s.candidateName}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(s.date, s.time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.time} · {formatDuration(s.duration)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {s.location}
                    </span>
                  </div>

                  {(s.leadCoach || s.support) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.leadCoach && `Coach: ${s.leadCoach}`}
                      {s.leadCoach && s.support && " · "}
                      {s.support && `Support: ${s.support}`}
                    </p>
                  )}

                  {s.notes && <p className="mt-1 text-xs text-muted-foreground italic">{s.notes}</p>}
                </div>

                {s.meetingLink && (
                  <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                    Join
                  </a>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
