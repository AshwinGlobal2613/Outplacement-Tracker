"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  CheckCircle2, Circle, CalendarDays, Clock, Briefcase, Link2,
  Upload, FileText, Download, Trash2, ExternalLink, BookOpen,
  User, Building2, GraduationCap, X, Target, Plus, Minus,
  ChevronDown, ChevronUp, Sparkles, Save, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CVProfile, CVExperience, CVEducation, WeeklyGoal } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type PortalSession = {
  id: string; type: string; title: string; date: string; time: string;
  duration: number; location: string; meetingLink: string; notes: string;
};

type PortalCandidate = {
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
  partner: string;
  clientName: string;
  newPlacement: string | null;
  newCompany: string | null;
  position: string | null;
  jobStatus: string | null;
  progress: {
    introductorySession: boolean;
    cvSessions: boolean;
    linkedinProfile: boolean;
    profiling: boolean;
    networkingPersonalBranding: boolean;
    custom?: { id: string; label: string; done: boolean }[];
  };
  sessions?: PortalSession[];
  activities?: { id: string; type: string; title: string; link: string; notes: string; createdAt: string }[];
  documents?: { id: string; name: string; size: number; mimeType: string; uploadedAt: string; source: string }[];
  candidateResources?: {
    id: string; title: string; description: string; type: string;
    url: string; fileName?: string; addedByName: string; addedAt: string;
  }[];
  goals?: WeeklyGoal[];
  cvProfile?: CVProfile;
};

const STATUS_COLOR: Record<string, string> = {
  referred:           "bg-amber-500/15 text-amber-400",
  active:             "bg-emerald-500/15 text-emerald-400",
  candidate_reached:  "bg-sky-500/15 text-sky-400",
  completed:          "bg-primary/15 text-primary",
  declined:           "bg-rose-500/15 text-rose-400",
};
const STATUS_LABEL: Record<string, string> = {
  referred: "Referred", active: "Active", candidate_reached: "Candidate Reached",
  completed: "Completed", declined: "Declined",
};

const MILESTONES = [
  { key: "introductorySession",        label: "Introductory Session" },
  { key: "cvSessions",                 label: "CV Sessions" },
  { key: "linkedinProfile",            label: "LinkedIn Profile" },
  { key: "profiling",                  label: "Profiling" },
  { key: "networkingPersonalBranding", label: "Networking & Personal Branding" },
];

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Goals section (inside Programme tab) ─────────────────────────────────────

function GoalsSection({ candidate }: { candidate: PortalCandidate }) {
  const [goals, setGoals] = useState<WeeklyGoal[]>(candidate.goals ?? []);
  const [updating, setUpdating] = useState<string | null>(null);

  async function increment(goal: WeeklyGoal, delta: number) {
    const newCount = Math.max(0, Math.min(goal.currentCount + delta, goal.targetCount));
    if (newCount === goal.currentCount) return;
    setUpdating(goal.id);
    const res = await fetch(`/api/candidates/${candidate.id}/goals`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: goal.id, currentCount: newCount }),
    });
    if (res.ok) {
      const updated = await res.json();
      setGoals(updated.goals ?? goals);
    }
    setUpdating(null);
  }

  if (goals.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Target className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Weekly Goals</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {goals.filter((g) => g.completed).length}/{goals.length} complete
        </span>
      </div>
      <div className="divide-y divide-border">
        {goals.map((goal) => {
          const pct = goal.targetCount > 0 ? Math.round((goal.currentCount / goal.targetCount) * 100) : 0;
          return (
            <div key={goal.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {goal.completed
                      ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
                    <p className={cn("text-sm font-medium", goal.completed ? "text-emerald-400 line-through" : "text-foreground")}>
                      {goal.title}
                    </p>
                    {goal.completed && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Done</span>
                    )}
                  </div>
                  {goal.description && (
                    <p className="mt-0.5 ml-6 text-xs text-muted-foreground">{goal.description}</p>
                  )}
                  {goal.weekLabel && (
                    <p className="mt-0.5 ml-6 text-[11px] text-muted-foreground/60">{goal.weekLabel}</p>
                  )}
                </div>

                {/* Counter */}
                {!goal.completed && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => increment(goal, -1)}
                      disabled={goal.currentCount === 0 || updating === goal.id}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-sidebar-accent disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-14 text-center text-sm font-semibold text-foreground">
                      {goal.currentCount}/{goal.targetCount}
                    </span>
                    <button
                      onClick={() => increment(goal, 1)}
                      disabled={goal.currentCount >= goal.targetCount || updating === goal.id}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/50 text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {goal.completed && (
                  <span className="text-xs text-muted-foreground shrink-0">{goal.targetCount}/{goal.targetCount}</span>
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-3 ml-6">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", goal.completed ? "bg-emerald-500" : "bg-primary")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Programme Tab ─────────────────────────────────────────────────────────────

function ProgramTab({ candidate }: { candidate: PortalCandidate }) {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = (candidate.sessions ?? [])
    .filter((s) => s.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const past = (candidate.sessions ?? [])
    .filter((s) => s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const baseDone   = MILESTONES.filter((m) => candidate.progress[m.key as keyof typeof candidate.progress]).length;
  const custom     = candidate.progress.custom ?? [];
  const customDone = custom.filter((m) => m.done).length;
  const total      = MILESTONES.length + custom.length;
  const done       = baseDone + customDone;
  const pct        = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Programme info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: User,          label: "Lead Coach",  value: candidate.leadCoach || "—" },
          { icon: Building2,     label: "Client",      value: candidate.clientName || "—" },
          { icon: GraduationCap, label: "Programme",   value: candidate.duration || "—" },
          { icon: CalendarDays,  label: "Start Date",  value: candidate.dateStarted ? fmtDate(candidate.dateStarted) : "—" },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-xs">{label}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Placement outcome */}
      {candidate.status === "completed" && candidate.newPlacement && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Placement Outcome</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            {candidate.newCompany && <div><span className="text-muted-foreground text-xs">New Company</span><p className="font-medium text-foreground mt-0.5">{candidate.newCompany}</p></div>}
            {candidate.position   && <div><span className="text-muted-foreground text-xs">Position</span><p className="font-medium text-foreground mt-0.5">{candidate.position}</p></div>}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-semibold text-foreground">Programme Milestones</h3>
          <span className="text-sm text-muted-foreground">{done}/{total} complete</span>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-2.5">
            {MILESTONES.map((m) => {
              const isDone = !!candidate.progress[m.key as keyof typeof candidate.progress];
              return (
                <div key={m.key} className="flex items-center gap-3">
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
                  <span className={cn("text-sm", isDone ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
                </div>
              );
            })}
            {custom.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                {m.done
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />}
                <span className={cn("text-sm", m.done ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Goals */}
      <GoalsSection candidate={candidate} />

      {/* Upcoming sessions — always shown */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Upcoming Sessions</h3>
          {upcoming.length > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {upcoming.length} scheduled
            </span>
          )}
        </div>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">Your coach will schedule sessions here</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((s) => {
              const d = new Date(`${s.date}T${s.time || "00:00"}`);
              return (
                <div key={s.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold text-primary">
                      {d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                      {s.time && ` · ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">{s.title || s.type}</p>
                    {s.duration > 0 && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {s.duration} min
                        {s.location && ` · ${s.location}`}
                      </p>
                    )}
                    {s.notes && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{s.notes}</p>}
                  </div>
                  {s.meetingLink && (
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                      <Link2 className="h-3 w-3" /> Join
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past sessions */}
      {past.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Past Sessions</h3>
            <span className="ml-auto text-xs text-muted-foreground">{past.length} completed</span>
          </div>
          <div className="divide-y divide-border">
            {past.slice(0, 5).map((s) => {
              const d = new Date(`${s.date}T${s.time || "00:00"}`);
              return (
                <div key={s.id} className="px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    {d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-sm font-medium text-foreground">{s.title || s.type}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resources Tab ─────────────────────────────────────────────────────────────

function ResourcesTab({ candidate }: { candidate: PortalCandidate }) {
  const resources = candidate.candidateResources ?? [];

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-20 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No resources yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Your coach will add resources here for you.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {resources.map((r) => (
        <div key={r.id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {r.type === "link" ? <Link2 className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground leading-snug">{r.title}</p>
              {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground">Added by {r.addedByName}</p>
            <a href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-3 w-3" />
              {r.type === "file" ? "Download" : "Open"}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────────

function DocumentsTab({ candidate, onUpload }: { candidate: PortalCandidate; onUpload: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState(candidate.documents ?? []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/candidates/${candidate.id}/documents`, { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Upload failed. Please try again.");
    } else {
      const data = await res.json();
      if (data.document) setDocs((prev) => [...prev, data.document]);
      onUpload();
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(docId: string) {
    setDeleting(docId);
    await fetch(`/api/candidates/${candidate.id}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: docId }),
    });
    setDeleting(null);
    setDocs((prev) => prev.filter((d) => d.id !== docId));
  }

  const myDocs = docs.filter((d) => d.source === "candidate" || d.source === undefined);

  return (
    <div className="space-y-5">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-10 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
      >
        <Upload className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">Click to upload a document</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, PowerPoint, images up to 50MB</p>
        {uploading && <p className="mt-3 text-xs text-primary animate-pulse">Uploading…</p>}
      </div>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt" />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <X className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {myDocs.length === 0 ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No documents uploaded yet. Upload your CV, cover letter, or any other relevant documents.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Your Uploaded Documents</h3>
          </div>
          <div className="divide-y divide-border">
            {myDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 px-5 py-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(doc.size)} · {fmtDate(doc.uploadedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a href={`/api/candidates/${candidate.id}/documents/${doc.id}/download`}
                    target="_blank" rel="noopener noreferrer" title="Download"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id} title="Delete"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-rose-500/15 hover:text-rose-400 transition-colors disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CV / LinkedIn Builder Tab ─────────────────────────────────────────────────

const EMPTY_CV: CVProfile = {
  headline: "", summary: "", linkedinAbout: "", skills: [], experience: [], education: [],
};

function newExp(): CVExperience {
  return { id: `exp_${Date.now()}`, company: "", role: "", from: "", to: "", current: false, description: "" };
}
function newEdu(): CVEducation {
  return { id: `edu_${Date.now()}`, institution: "", degree: "", field: "", from: "", to: "" };
}

function CVBuilderTab({ candidate }: { candidate: PortalCandidate }) {
  const [cv, setCv] = useState<CVProfile>(candidate.cvProfile ?? EMPTY_CV);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>("basics");
  const [exportMode, setExportMode] = useState(false);

  function toggleSection(s: string) {
    setActiveSection((prev) => (prev === s ? null : s));
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/candidates/${candidate.id}/cv`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cv),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || cv.skills.includes(s)) return;
    setCv((p) => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setCv((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));
  }

  function addExp() { setCv((p) => ({ ...p, experience: [...p.experience, newExp()] })); }
  function removeExp(id: string) { setCv((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) })); }
  function updateExp(id: string, field: keyof CVExperience, value: string | boolean) {
    setCv((p) => ({ ...p, experience: p.experience.map((e) => e.id === id ? { ...e, [field]: value } : e) }));
  }

  function addEdu() { setCv((p) => ({ ...p, education: [...p.education, newEdu()] })); }
  function removeEdu(id: string) { setCv((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) })); }
  function updateEdu(id: string, field: keyof CVEducation, value: string) {
    setCv((p) => ({ ...p, education: p.education.map((e) => e.id === id ? { ...e, [field]: value } : e) }));
  }

  // Auto-generate LinkedIn About from summary + experience
  function generateLinkedIn() {
    const latestExp = cv.experience[0];
    const roleStr = latestExp ? `${latestExp.role} at ${latestExp.company}. ` : "";
    const skillStr = cv.skills.length > 0 ? `Core skills: ${cv.skills.slice(0, 5).join(", ")}.` : "";
    const generated = `${cv.headline ? cv.headline + "\n\n" : ""}${cv.summary ? cv.summary + "\n\n" : ""}${roleStr}${skillStr}`.trim();
    setCv((p) => ({ ...p, linkedinAbout: generated }));
  }

  // Plain-text CV export
  function exportAsText() {
    const lines: string[] = [];
    lines.push(candidate.candidateName.toUpperCase());
    if (cv.headline) lines.push(cv.headline);
    lines.push("");
    if (cv.summary) { lines.push("PROFESSIONAL SUMMARY"); lines.push(cv.summary); lines.push(""); }
    if (cv.experience.length > 0) {
      lines.push("EXPERIENCE");
      cv.experience.forEach((e) => {
        lines.push(`${e.role} — ${e.company} (${e.from}${e.current ? " – Present" : e.to ? ` – ${e.to}` : ""})`);
        if (e.description) lines.push(e.description);
        lines.push("");
      });
    }
    if (cv.education.length > 0) {
      lines.push("EDUCATION");
      cv.education.forEach((e) => {
        lines.push(`${e.degree}${e.field ? ` in ${e.field}` : ""} — ${e.institution} (${e.from}${e.to ? ` – ${e.to}` : ""})`);
      });
      lines.push("");
    }
    if (cv.skills.length > 0) { lines.push("SKILLS"); lines.push(cv.skills.join(" · ")); }
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${candidate.candidateName.replace(/\s+/g, "_")}_CV.txt`;
    a.click();
  }

  const SectionHeader = ({ id, title, icon: Icon }: { id: string; title: string; icon: React.ElementType }) => (
    <button
      onClick={() => toggleSection(id)}
      className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-sidebar-accent/50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {activeSection === id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
    </button>
  );

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30";
  const textareaCls = `${inputCls} resize-none`;
  const labelCls = "block text-xs font-medium text-muted-foreground mb-1";

  if (exportMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">CV Preview</h3>
          <div className="flex items-center gap-2">
            <button onClick={exportAsText}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Download className="h-3.5 w-3.5" /> Export as Text
            </button>
            <button onClick={() => setExportMode(false)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              ← Back to Editor
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-8 font-mono text-sm text-foreground whitespace-pre-wrap">
          <p className="font-bold text-base">{candidate.candidateName.toUpperCase()}</p>
          {cv.headline && <p className="text-muted-foreground mt-1">{cv.headline}</p>}
          {cv.summary && (<><p className="mt-5 font-bold text-xs tracking-widest text-primary">PROFESSIONAL SUMMARY</p><p className="mt-1 text-sm">{cv.summary}</p></>)}
          {cv.experience.length > 0 && (
            <>
              <p className="mt-5 font-bold text-xs tracking-widest text-primary">EXPERIENCE</p>
              {cv.experience.map((e) => (
                <div key={e.id} className="mt-3">
                  <p className="font-semibold">{e.role} — {e.company}</p>
                  <p className="text-xs text-muted-foreground">{e.from}{e.current ? " – Present" : e.to ? ` – ${e.to}` : ""}</p>
                  {e.description && <p className="mt-1 text-sm">{e.description}</p>}
                </div>
              ))}
            </>
          )}
          {cv.education.length > 0 && (
            <>
              <p className="mt-5 font-bold text-xs tracking-widest text-primary">EDUCATION</p>
              {cv.education.map((e) => (
                <div key={e.id} className="mt-3">
                  <p className="font-semibold">{e.degree}{e.field ? ` in ${e.field}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{e.institution} · {e.from}{e.to ? ` – ${e.to}` : ""}</p>
                </div>
              ))}
            </>
          )}
          {cv.skills.length > 0 && (
            <>
              <p className="mt-5 font-bold text-xs tracking-widest text-primary">SKILLS</p>
              <p className="mt-1">{cv.skills.join(" · ")}</p>
            </>
          )}
        </div>
        {cv.linkedinAbout && (
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-5">
            <p className="mb-2 text-xs font-bold tracking-widest text-sky-400">LINKEDIN ABOUT</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{cv.linkedinAbout}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">CV & LinkedIn Builder</h3>
          <p className="text-xs text-muted-foreground">Build your CV and LinkedIn profile. Changes are saved automatically.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExportMode(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" /> Preview & Export
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* Basics */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader id="basics" title="Basics" icon={User} />
        {activeSection === "basics" && (
          <div className="border-t border-border px-5 py-4 space-y-4">
            <div>
              <label className={labelCls}>Professional Headline</label>
              <input value={cv.headline} onChange={(e) => setCv((p) => ({ ...p, headline: e.target.value }))}
                placeholder="e.g. Senior Product Manager | SaaS | B2B" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Professional Summary</label>
              <textarea value={cv.summary} onChange={(e) => setCv((p) => ({ ...p, summary: e.target.value }))}
                rows={4} placeholder="A short paragraph describing your career, strengths, and what you're looking for…" className={textareaCls} />
            </div>
          </div>
        )}
      </div>

      {/* Experience */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader id="experience" title={`Experience (${cv.experience.length})`} icon={Briefcase} />
        {activeSection === "experience" && (
          <div className="border-t border-border divide-y divide-border">
            {cv.experience.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">No experience added yet.</p>
            )}
            {cv.experience.map((exp, i) => (
              <div key={exp.id} className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Role {i + 1}</p>
                  <button onClick={() => removeExp(exp.id)} className="text-muted-foreground/50 hover:text-rose-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input value={exp.role} onChange={(e) => updateExp(exp.id, "role", e.target.value)}
                      placeholder="e.g. Senior Product Manager" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)}
                      placeholder="e.g. Acme Corp" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>From</label>
                    <input value={exp.from} onChange={(e) => updateExp(exp.id, "from", e.target.value)}
                      placeholder="e.g. Jan 2020" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>To</label>
                    <div className="flex items-center gap-2">
                      <input value={exp.current ? "Present" : exp.to} onChange={(e) => updateExp(exp.id, "to", e.target.value)}
                        placeholder="e.g. Dec 2023" disabled={exp.current} className={cn(inputCls, "flex-1")} />
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, "current", e.target.checked)} className="rounded" />
                        Current
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description & Key Achievements</label>
                  <textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                    rows={3} placeholder="Describe your responsibilities and key achievements…" className={textareaCls} />
                </div>
              </div>
            ))}
            <div className="px-5 py-3">
              <button onClick={addExp}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
                <Plus className="h-3.5 w-3.5" /> Add Role
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Education */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader id="education" title={`Education (${cv.education.length})`} icon={GraduationCap} />
        {activeSection === "education" && (
          <div className="border-t border-border divide-y divide-border">
            {cv.education.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted-foreground">No education added yet.</p>
            )}
            {cv.education.map((edu, i) => (
              <div key={edu.id} className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Entry {i + 1}</p>
                  <button onClick={() => removeEdu(edu.id)} className="text-muted-foreground/50 hover:text-rose-400 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>Institution</label>
                    <input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)}
                      placeholder="e.g. University of Manchester" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)}
                      placeholder="e.g. BSc, MBA" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Field of Study</label>
                    <input value={edu.field} onChange={(e) => updateEdu(edu.id, "field", e.target.value)}
                      placeholder="e.g. Computer Science" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>From</label>
                      <input value={edu.from} onChange={(e) => updateEdu(edu.id, "from", e.target.value)}
                        placeholder="2018" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>To</label>
                      <input value={edu.to} onChange={(e) => updateEdu(edu.id, "to", e.target.value)}
                        placeholder="2021" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="px-5 py-3">
              <button onClick={addEdu}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
                <Plus className="h-3.5 w-3.5" /> Add Education
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader id="skills" title={`Skills (${cv.skills.length})`} icon={Target} />
        {activeSection === "skills" && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter…" className={cn(inputCls, "flex-1")} />
              <button onClick={addSkill} disabled={!skillInput.trim()}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {cv.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {cv.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-primary/60 hover:text-primary transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* LinkedIn About */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <SectionHeader id="linkedin" title="LinkedIn About Section" icon={Link2} />
        {activeSection === "linkedin" && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Write or generate your LinkedIn &quot;About&quot; section (2,000 character limit).</p>
              <button onClick={generateLinkedIn}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                <Sparkles className="h-3.5 w-3.5" /> Auto-generate from profile
              </button>
            </div>
            <textarea value={cv.linkedinAbout}
              onChange={(e) => setCv((p) => ({ ...p, linkedinAbout: e.target.value.slice(0, 2000) }))}
              rows={8} placeholder="Write a compelling LinkedIn About section…" className={textareaCls} />
            <p className="text-right text-[11px] text-muted-foreground">{cv.linkedinAbout.length}/2000</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "program" | "resources" | "documents" | "cv";

export default function PortalPage() {
  const { data: session } = useSession();
  const [candidate, setCandidate] = useState<PortalCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("program");

  const isCandidateRole = session?.user?.role === "candidate";

  async function load() {
    try {
      const url = isCandidateRole ? "/api/portal/me" : "/api/portal/candidates";
      const res = await fetch(url);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed to load your profile.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setCandidate(isCandidateRole ? data : (Array.isArray(data) ? data[0] ?? null : data));
    } catch {
      setError("Failed to load your profile.");
    }
    setLoading(false);
  }

  useEffect(() => { if (session) load(); }, [session]);

  const today = new Date();
  const greeting = today.getHours() < 12 ? "Good morning" : today.getHours() < 18 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-card border border-border" />)}
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
        <p className="text-sm text-muted-foreground">{error || "No profile found."}</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "program",   label: "Programme",   icon: GraduationCap },
    { id: "resources", label: "Resources",   icon: BookOpen },
    { id: "documents", label: "Documents",   icon: FileText },
    { id: "cv",        label: "CV Builder",  icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
          {candidate.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greeting}, <span className="text-primary">{candidate.candidateName.split(" ")[0]}</span>
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_COLOR[candidate.status] ?? "bg-muted text-muted-foreground")}>
              {STATUS_LABEL[candidate.status] ?? candidate.status}
            </span>
            <span className="text-xs text-muted-foreground">{candidate.clientName}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "program"   && <ProgramTab   candidate={candidate} />}
      {tab === "resources" && <ResourcesTab candidate={candidate} />}
      {tab === "documents" && <DocumentsTab candidate={candidate} onUpload={load} />}
      {tab === "cv"        && <CVBuilderTab  candidate={candidate} />}
    </div>
  );
}
