"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import {
  Pencil, Trash2, ExternalLink, MessageCircle, CheckCircle2,
  Circle, ArrowLeft, Briefcase, CalendarDays, Users2, Link2, Plus, X, Flag, Clock, MapPin, Activity,
} from "lucide-react";
import { Candidate, CandidateActivity, ActivityType, CustomMilestone, Session, ActivityLog } from "@/lib/types";
import { ScheduleModal } from "@/components/outplacement/schedule-modal";
import { DocumentManager } from "@/components/outplacement/document-manager";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CandidateModal } from "@/components/outplacement/candidate-modal";

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

const activityConfig: Record<ActivityType, { label: string; icon: React.ElementType; color: string }> = {
  job: { label: "Job Opportunity", icon: Briefcase, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  event: { label: "Event", icon: CalendarDays, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  network: { label: "Network / Connection", icon: Users2, color: "text-violet-400 bg-violet-500/10 border-violet-500/20" },
};

const progressSteps = [
  { key: "introductorySession", label: "Introductory Session" },
  { key: "cvSessions", label: "CV Sessions" },
  { key: "linkedinProfile", label: "LinkedIn & Profile" },
  { key: "profiling", label: "Profiling (DiSC)" },
  { key: "networkingPersonalBranding", label: "Networking & Personal Branding" },
];

function CandidateDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backFrom = searchParams.get("from") ?? "active";
  const backHref = backFrom === "admin"
    ? "/outplacement/admin/candidate-management"
    : `/outplacement/candidates?tab=${backFrom}`;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  async function load() {
    try {
      const res = await fetch(`/api/candidates/${params.id}`);
      if (!res.ok) { router.push(backHref); return; }
      setCandidate(await res.json());
    } catch {
      router.push(backHref);
      return;
    }
    setLoading(false);
    // Load activity log in parallel (non-blocking)
    fetch(`/api/candidates/${params.id}/activity`)
      .then((r) => r.ok ? r.json() : [])
      .then((logs) => setActivityLog(Array.isArray(logs) ? logs : []))
      .catch(() => {});
  }

  useEffect(() => { load(); }, [params.id]);

  async function handleDelete() {
    if (!confirm(`Delete ${candidate?.candidateName}? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/candidates/${params.id}`, { method: "DELETE" });
    router.push(backHref);
  }

  async function saveProgress(progress: Candidate["progress"]) {
    if (!candidate) return;
    const updated = { ...candidate, progress };
    await fetch(`/api/candidates/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setCandidate(updated);
  }

  function toggleProgress(key: string) {
    if (!candidate) return;
    saveProgress({ ...candidate.progress, [key]: !candidate.progress[key as keyof typeof candidate.progress] });
  }

  function addCustomMilestone(label: string) {
    if (!candidate) return;
    const custom = [...(candidate.progress.custom ?? []), { id: `cm_${Date.now()}`, label, done: false }];
    saveProgress({ ...candidate.progress, custom });
  }

  function toggleCustomMilestone(id: string) {
    if (!candidate) return;
    const custom = (candidate.progress.custom ?? []).map((m) => m.id === id ? { ...m, done: !m.done } : m);
    saveProgress({ ...candidate.progress, custom });
  }

  function removeCustomMilestone(id: string) {
    if (!candidate) return;
    const custom = (candidate.progress.custom ?? []).filter((m) => m.id !== id);
    saveProgress({ ...candidate.progress, custom });
  }

  async function addActivity(act: Omit<CandidateActivity, "id" | "createdAt" | "createdBy">) {
    const res = await fetch(`/api/candidates/${params.id}/tracking`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(act),
    });
    if (res.ok) setCandidate(await res.json());
  }

  async function removeActivity(activityId: string) {
    const res = await fetch(`/api/candidates/${params.id}/tracking`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityId }),
    });
    if (res.ok) setCandidate(await res.json());
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (!candidate) return null;

  const customMilestones: CustomMilestone[] = candidate.progress.custom ?? [];
  const standardDone = progressSteps.filter((s) => candidate.progress[s.key as keyof typeof candidate.progress]).length;
  const customDone = customMilestones.filter((m) => m.done).length;
  const progressCount = standardDone + customDone;
  const totalMilestones = 5 + customMilestones.length;
  const pct = totalMilestones > 0 ? Math.round((progressCount / totalMilestones) * 100) : 0;
  const activities = candidate.activities ?? [];
  const jobCount = activities.filter((a) => a.type === "job").length;
  const eventCount = activities.filter((a) => a.type === "event").length;
  const networkCount = activities.filter((a) => a.type === "network").length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start gap-4">
        <Link href={backHref} className="mt-1 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <PageHeader title={candidate.candidateName} description={`${candidate.clientName} · ${candidate.partner}`}>
            <button onClick={() => setShowSchedule(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} /> Schedule Session
            </button>
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </PageHeader>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col */}
        <div className="col-span-2 space-y-5">
          {/* Status & Meta */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold uppercase", statusColors[candidate.status])}>
                {statusLabels[candidate.status] ?? candidate.status}
              </span>
              {candidate.levelOfSupport && (
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-400">
                  {candidate.levelOfSupport} Support
                </span>
              )}
              {candidate.discStyle && (
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  DiSC: {candidate.discStyle}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              <InfoRow label="Lead Coach" value={candidate.leadCoach} />
              <InfoRow label="Support" value={candidate.support} />
              <InfoRow label="Duration" value={candidate.duration} />
              <InfoRow label="Date Started" value={candidate.dateStarted ? new Date(candidate.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <InfoRow label="End Date" value={candidate.endDate ? new Date(candidate.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
              <InfoRow label="Sessions Done" value={`${progressCount} / ${totalMilestones}`} />
              {candidate.oldPlacement && <InfoRow label="From" value={candidate.oldPlacement} />}
              {candidate.newPlacement && <InfoRow label="Target / New" value={candidate.newPlacement} />}
              {candidate.position && <InfoRow label="Position" value={candidate.position} />}
              {candidate.sector && <InfoRow label="Sector" value={candidate.sector} />}
            </div>
          </div>

          {/* Program Milestones */}
          <MilestonesPanel
            candidate={candidate}
            progressCount={progressCount}
            totalMilestones={totalMilestones}
            pct={pct}
            customMilestones={customMilestones}
            onToggleStandard={toggleProgress}
            onAddCustom={addCustomMilestone}
            onToggleCustom={toggleCustomMilestone}
            onRemoveCustom={removeCustomMilestone}
          />

          {/* Notes */}
          {candidate.notes && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-3 font-semibold text-foreground">Notes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          )}

          {/* Scheduled Sessions */}
          <SessionsList
            sessions={candidate.sessions ?? []}
            onDelete={async (sessionId) => {
              const res = await fetch(`/api/candidates/${params.id}/sessions`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId }),
              });
              if (res.ok) load();
            }}
            onSchedule={() => setShowSchedule(true)}
          />

          {/* Activity Tracking */}
          <ActivityTracker
            activities={activities}
            jobCount={jobCount}
            eventCount={eventCount}
            networkCount={networkCount}
            onAdd={addActivity}
            onRemove={removeActivity}
          />

          {/* Documents */}
          <DocumentManager
            candidate={candidate}
            onUpdated={(updated) => setCandidate(updated)}
          />

          {/* Activity Log */}
          <CandidateActivityLog logs={activityLog} />
        </div>

        {/* Right col: Contact + Program */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 font-semibold text-foreground">Contact</h2>
            <div className="space-y-3">
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <MessageCircle className="h-4 w-4" /> {candidate.email}
                </a>
              )}
              {candidate.whatsapp && (
                <a href={`https://wa.me/${candidate.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-400 hover:underline">
                  <MessageCircle className="h-4 w-4" /> WhatsApp: {candidate.whatsapp}
                </a>
              )}
              {candidate.linkedin && (
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
                  <ExternalLink className="h-4 w-4" /> LinkedIn Profile
                </a>
              )}
              {!candidate.email && !candidate.whatsapp && !candidate.linkedin && (
                <p className="text-sm text-muted-foreground">No contact info saved</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-semibold text-foreground">Program</h2>
            <dl className="space-y-2">
              <InfoRow label="Partner" value={candidate.partner} />
              <InfoRow label="Client" value={candidate.clientName} />
            </dl>
          </div>

          {candidate.updatedAt && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated {new Date(candidate.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {showEdit && (
        <CandidateModal candidate={candidate} isAdmin={isAdmin} onClose={() => setShowEdit(false)} onSaved={() => { setShowEdit(false); load(); }} />
      )}
      {showSchedule && (
        <ScheduleModal candidate={candidate} onClose={() => setShowSchedule(false)} onSaved={() => load()} />
      )}
    </div>
  );
}

/* ─── Sessions List ─── */
function SessionsList({
  sessions, onDelete, onSchedule,
}: {
  sessions: Session[];
  onDelete: (id: string) => void;
  onSchedule: () => void;
}) {
  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(`${s.date}T${s.time}`) >= now).sort((a, b) => a.date.localeCompare(b.date));
  const past = sessions.filter((s) => new Date(`${s.date}T${s.time}`) < now).sort((a, b) => b.date.localeCompare(a.date));

  function formatDate(date: string, time: string) {
    return new Date(`${date}T${time}`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  function formatDuration(mins: number) {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Scheduled Sessions</h2>
        <button onClick={onSchedule}
          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" /> Schedule
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No sessions scheduled yet.</p>
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Upcoming</p>
              <div className="space-y-2">
                {upcoming.map((s) => (
                  <SessionRow key={s.id} session={s} formatDate={formatDate} formatDuration={formatDuration} onDelete={onDelete} isUpcoming />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Past</p>
              <div className="space-y-2">
                {past.map((s) => (
                  <SessionRow key={s.id} session={s} formatDate={formatDate} formatDuration={formatDuration} onDelete={onDelete} isUpcoming={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session, formatDate, formatDuration, onDelete, isUpcoming }: {
  session: Session;
  formatDate: (d: string, t: string) => string;
  formatDuration: (m: number) => string;
  onDelete: (id: string) => void;
  isUpcoming: boolean;
}) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border px-4 py-3 group",
      isUpcoming ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20"
    )}>
      <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        isUpcoming ? "bg-primary/20" : "bg-muted")}>
        <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">{session.title}</p>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold",
            isUpcoming ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
            {session.type}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" style={{ color: "#ffffff" }} />{formatDate(session.date, session.time)}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time} · {formatDuration(session.duration)}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{session.location}</span>
        </div>
        {session.meetingLink && (
          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline truncate">
            <Link2 className="h-3 w-3 shrink-0" />{session.meetingLink}
          </a>
        )}
        {session.notes && <p className="mt-1 text-xs text-muted-foreground">{session.notes}</p>}
      </div>
      <button onClick={() => onDelete(session.id)}
        className="ml-2 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─── Milestones Panel ─── */
function MilestonesPanel({
  candidate, progressCount, totalMilestones, pct, customMilestones,
  onToggleStandard, onAddCustom, onToggleCustom, onRemoveCustom,
}: {
  candidate: Candidate;
  progressCount: number;
  totalMilestones: number;
  pct: number;
  customMilestones: CustomMilestone[];
  onToggleStandard: (key: string) => void;
  onAddCustom: (label: string) => void;
  onToggleCustom: (id: string) => void;
  onRemoveCustom: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  function handleAdd() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setNewLabel("");
    setShowAdd(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Program Milestones</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{progressCount}/{totalMilestones} complete · {pct}%</span>
          <button onClick={() => setShowAdd((v) => !v)}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="space-y-2">
        {/* Fixed milestones */}
        {progressSteps.map((step, i) => {
          const done = candidate.progress[step.key as keyof typeof candidate.progress];
          return (
            <button key={step.key} onClick={() => onToggleStandard(step.key)}
              className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-sidebar-accent">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground")}>
                {i + 1}
              </div>
              {done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />}
              <span className={cn("text-sm font-medium", done ? "text-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>
                {step.label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{done ? "Complete" : "Pending"}</span>
            </button>
          );
        })}

        {/* Custom milestones */}
        {customMilestones.map((m, i) => (
          <div key={m.id} className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 transition-colors hover:bg-sidebar-accent group">
            <button onClick={() => onToggleCustom(m.id)} className="flex flex-1 items-center gap-3 text-left">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                m.done ? "bg-emerald-500/20 text-emerald-400" : "bg-violet-500/10 text-violet-400")}>
                <Flag className="h-3.5 w-3.5" />
              </div>
              {m.done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />}
              <span className={cn("text-sm font-medium", m.done ? "text-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>
                {m.label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">{m.done ? "Complete" : "Pending"}</span>
            </button>
            <button onClick={() => onRemoveCustom(m.id)}
              className="ml-2 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add custom form */}
        {showAdd && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
            <Flag className="h-4 w-4 shrink-0 text-primary/60" />
            <input
              autoFocus
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
              placeholder="Milestone name…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button onClick={handleAdd} disabled={!newLabel.trim()}
              className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
              Add
            </button>
            <button onClick={() => { setShowAdd(false); setNewLabel(""); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Activity Tracker ─── */
function ActivityTracker({
  activities, jobCount, eventCount, networkCount, onAdd, onRemove,
}: {
  activities: CandidateActivity[];
  jobCount: number; eventCount: number; networkCount: number;
  onAdd: (a: Omit<CandidateActivity, "id" | "createdAt" | "createdBy">) => void;
  onRemove: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "job" as ActivityType, title: "", link: "", notes: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!form.title || !form.link) return;
    setSaving(true);
    await onAdd(form);
    setForm({ type: "job", title: "", link: "", notes: "" });
    setShowForm(false);
    setSaving(false);
  }

  const summaryItems = [
    { label: "Job Opportunities", count: jobCount, type: "job" as ActivityType },
    { label: "Events", count: eventCount, type: "event" as ActivityType },
    { label: "Networks / Connections", count: networkCount, type: "network" as ActivityType },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Opportunities Sent</h2>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {/* Summary counts */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        {summaryItems.map(({ label, count, type }) => {
          const { icon: Icon, color } = activityConfig[type];
          return (
            <div key={type} className={cn("rounded-lg border p-3 text-center", activityConfig[type].color.split(" ").slice(1).join(" "))}>
              <Icon className={cn("mx-auto mb-1 h-4 w-4", activityConfig[type].color.split(" ")[0])} />
              <p className={cn("text-xl font-bold", activityConfig[type].color.split(" ")[0])}>{count}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-sidebar/40 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Entry</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as ActivityType }))} className={inputCls}>
                <option value="job">Job Opportunity</option>
                <option value="event">Event</option>
                <option value="network">Network / Connection</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Title *</label>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Role, event name…" className={inputCls} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Link * <span className="text-muted-foreground/60">(URL)</span></label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="https://…" className={inputCls + " pl-8"} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Notes</label>
            <input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Optional context…" className={inputCls} />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={!form.title || !form.link || saving}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Activity list */}
      {activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No opportunities tracked yet — click Add to start.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => {
            const cfg = activityConfig[act.type];
            const Icon = cfg.icon;
            const [iconColor, bgColor, borderColor] = cfg.color.split(" ");
            return (
              <div key={act.id} className={cn("flex items-start gap-3 rounded-lg border p-3", bgColor, borderColor)}>
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconColor)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{act.title}</p>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", bgColor, iconColor)}>
                      {cfg.label}
                    </span>
                  </div>
                  <a href={act.link} target="_blank" rel="noopener noreferrer"
                    className={cn("flex items-center gap-1 text-xs hover:underline truncate mt-0.5", iconColor)}>
                    <Link2 className="h-3 w-3 shrink-0" /> {act.link}
                  </a>
                  {act.notes && <p className="mt-0.5 text-xs text-muted-foreground">{act.notes}</p>}
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {act.createdBy} · {new Date(act.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => onRemove(act.id)} className="ml-auto shrink-0 text-muted-foreground/40 hover:text-rose-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Candidate Activity Log ─── */
function CandidateActivityLog({ logs }: { logs: ActivityLog[] }) {
  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">Activity Log</h2>
      </div>

      {logs.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3.5 top-0 h-full w-px bg-border" />
          <ul className="space-y-4 pl-10">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                {/* Dot */}
                <div className="absolute -left-[26px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 ring-2 ring-card">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>
                <div>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{log.userName}</span>
                    {" "}
                    <span className="text-muted-foreground">{log.action}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <CandidateDetailContent params={params} />
    </Suspense>
  );
}

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
