"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import {
  Pencil, Trash2, ExternalLink, MessageCircle, CheckCircle2,
  Circle, ArrowLeft, Briefcase, CalendarDays, Users2, Link2, Plus, X, Flag, Clock, MapPin, Activity, FileText, Search, Target, GripVertical, ShieldCheck,
} from "lucide-react";
import { Candidate, CandidateActivity, CandidateResource, ActivityType, CustomMilestone, Session, ActivityLog, WeeklyGoal, InvoiceStatus, CostingStatus } from "@/lib/types";
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

/* ─── Resource Manager ───────────────────────────────────────── */
type LibraryResource = { id: string; title: string; description: string; type: string; content: string; category: string };

function ResourceManager({ candidateId }: { candidateId: string }) {
  const [resources, setResources] = useState<CandidateResource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"library" | "manual">("library");
  // Manual form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  // Library
  const [library, setLibrary] = useState<LibraryResource[]>([]);
  const [libSearch, setLibSearch] = useState("");
  const [libLoading, setLibLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/resources`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setResources(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [candidateId]);

  useEffect(() => {
    if (showForm && tab === "library" && library.length === 0) {
      setLibLoading(true);
      fetch("/api/resources")
        .then((r) => r.ok ? r.json() : [])
        .then((data) => setLibrary(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLibLoading(false));
    }
  }, [showForm, tab]);

  async function postResource(body: Record<string, string>) {
    const res = await fetch(`/api/candidates/${candidateId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const created = await res.json();
      setResources((prev) => [...prev, created]);
      return true;
    }
    const d = await res.json();
    setError(d.error || "Failed to add resource.");
    return false;
  }

  async function addFromLibrary(item: LibraryResource) {
    setError("");
    const url = item.type === "link" || item.type === "document" ? item.content : "";
    if (!url) { setError("This resource has no URL to share."); return; }
    setAdding(item.id);
    await postResource({ title: item.title, description: item.description, url, type: "link" });
    setAdding(null);
  }

  async function addManual() {
    setError("");
    if (!title.trim() || !url.trim()) { setError("Title and URL are required."); return; }
    let fullUrl = url.trim();
    if (!/^https?:\/\//i.test(fullUrl)) fullUrl = "https://" + fullUrl;
    setSaving(true);
    const ok = await postResource({ title: title.trim(), description: description.trim(), url: fullUrl, type: "link" });
    setSaving(false);
    if (ok) { setTitle(""); setDescription(""); setUrl(""); setShowForm(false); }
  }

  async function deleteResource(id: string) {
    await fetch(`/api/candidates/${candidateId}/resources`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId: id }),
    });
    setResources((prev) => prev.filter((r) => r.id !== id));
  }

  const alreadyAdded = new Set(resources.map((r) => r.url));
  const filteredLib = library.filter((item) => {
    const hasUrl = item.type === "link" || item.type === "document";
    const matchSearch = !libSearch || item.title.toLowerCase().includes(libSearch.toLowerCase()) || item.category.toLowerCase().includes(libSearch.toLowerCase());
    return hasUrl && matchSearch;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          Resources
          {resources.length > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {resources.length}
            </span>
          )}
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Resource
        </button>
      </div>

      {/* Add panel */}
      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-background overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["library", "manual"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
                  tab === t
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "library" ? "📚 Pick from Resource Library" : "🔗 Add New Link"}
              </button>
            ))}
          </div>

          <div className="p-4">
            {error && <p className="mb-3 text-xs text-destructive">{error}</p>}

            {tab === "library" ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    value={libSearch}
                    onChange={(e) => setLibSearch(e.target.value)}
                    placeholder="Search resources…"
                    className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {libLoading ? (
                  <p className="text-xs text-muted-foreground py-2">Loading library…</p>
                ) : filteredLib.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    {library.length === 0 ? "No resources in your library yet." : "No matching resources found."}
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                    {filteredLib.map((item) => {
                      const isAdded = alreadyAdded.has(item.content);
                      return (
                        <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <button
                            onClick={() => addFromLibrary(item)}
                            disabled={isAdded || adding === item.id}
                            className={`shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                              isAdded
                                ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                                : "bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                            }`}
                          >
                            {adding === item.id ? "Adding…" : isAdded ? "✓ Added" : "Add"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => { setShowForm(false); setError(""); setLibSearch(""); }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Interview Preparation Guide"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">URL *</label>
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Description <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief note for the candidate"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => { setShowForm(false); setError(""); setTitle(""); setUrl(""); setDescription(""); }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addManual}
                    disabled={saving}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    {saving ? "Saving…" : "Add Resource"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resource list */}
      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No resources added yet. Click &quot;Add Resource&quot; to share content with this candidate.
        </p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  {r.title}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                )}
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Added by {r.addedByName} · {new Date(r.addedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => deleteResource(r.id)}
                title="Remove resource"
                className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Goals Manager (admin side) ─── */
function GoalsManager({ candidateId }: { candidateId: string }) {
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  // Form state
  const [gTitle, setGTitle] = useState("");
  const [gDescription, setGDescription] = useState("");
  const [gTarget, setGTarget] = useState("1");
  const [gWeek, setGWeek] = useState("");
  const [gDue, setGDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/candidates/${candidateId}/goals`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setGoals(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [candidateId]);

  async function createGoal() {
    setError("");
    if (!gTitle.trim()) { setError("Title is required."); return; }
    setSaving(true);
    const res = await fetch(`/api/candidates/${candidateId}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: gTitle.trim(),
        description: gDescription.trim(),
        targetCount: parseInt(gTarget) || 1,
        weekLabel: gWeek.trim(),
        dueDate: gDue || undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Failed"); return; }
    const { goal } = await res.json();
    setGoals((p) => [...p, goal]);
    setGTitle(""); setGDescription(""); setGTarget("1"); setGWeek(""); setGDue("");
    setShowForm(false);
  }

  async function deleteGoal(goalId: string) {
    setDeleting(goalId);
    await fetch(`/api/candidates/${candidateId}/goals`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId }),
    });
    setGoals((p) => p.filter((g) => g.id !== goalId));
    setDeleting(null);
  }

  const inputCls = "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Weekly Goals
          {goals.length > 0 && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{goals.length}</span>
          )}
        </h2>
        <button onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Goal
        </button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4 space-y-3">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Goal Title *</label>
              <input value={gTitle} onChange={(e) => setGTitle(e.target.value)}
                placeholder="e.g. Apply to 5 roles this week" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
              <input value={gDescription} onChange={(e) => setGDescription(e.target.value)}
                placeholder="Optional details for the candidate" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Count *</label>
              <input type="number" min="1" value={gTarget} onChange={(e) => setGTarget(e.target.value)}
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Week Label</label>
              <input value={gWeek} onChange={(e) => setGWeek(e.target.value)}
                placeholder="e.g. Week of 26 May 2026" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Due Date</label>
              <input type="date" value={gDue} onChange={(e) => setGDue(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => { setShowForm(false); setError(""); }}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button onClick={createGoal} disabled={saving}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? "Saving…" : "Create Goal"}
            </button>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No goals set. Click &quot;Add Goal&quot; to assign a weekly target to this candidate.</p>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => {
            const pct = goal.targetCount > 0 ? Math.round((goal.currentCount / goal.targetCount) * 100) : 0;
            return (
              <div key={goal.id} className="rounded-lg border border-border bg-background px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground">{goal.title}</p>
                      {goal.completed && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Completed</span>
                      )}
                    </div>
                    {goal.description && <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-xs text-muted-foreground">
                        Progress: {goal.currentCount}/{goal.targetCount}
                        {goal.weekLabel && <span className="ml-2 text-muted-foreground/60">· {goal.weekLabel}</span>}
                      </p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full transition-all", goal.completed ? "bg-emerald-500" : "bg-primary")}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} disabled={deleting === goal.id}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-rose-500/15 hover:text-rose-400 transition-colors disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [editSession, setEditSession] = useState<Session | null>(null);
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
    const newId = `cm_${Date.now()}`;
    const custom = [...(candidate.progress.custom ?? []), { id: newId, label, done: false }];
    const currentOrder = candidate.progress.milestoneOrder ??
      [...progressSteps.map((s) => s.key), ...(candidate.progress.custom ?? []).map((m) => m.id)];
    saveProgress({ ...candidate.progress, custom, milestoneOrder: [...currentOrder, newId] });
  }

  function toggleCustomMilestone(id: string) {
    if (!candidate) return;
    const custom = (candidate.progress.custom ?? []).map((m) => m.id === id ? { ...m, done: !m.done } : m);
    saveProgress({ ...candidate.progress, custom });
  }

  function removeCustomMilestone(id: string) {
    if (!candidate) return;
    const custom = (candidate.progress.custom ?? []).filter((m) => m.id !== id);
    const milestoneOrder = (
      candidate.progress.milestoneOrder ??
      [...progressSteps.map((s) => s.key), ...(candidate.progress.custom ?? []).map((m) => m.id)]
    ).filter((oid) => oid !== id);
    saveProgress({ ...candidate.progress, custom, milestoneOrder });
  }

  function removeStandardMilestone(key: string) {
    if (!candidate) return;
    const currentOrder = candidate.progress.milestoneOrder ??
      [...progressSteps.map((s) => s.key), ...(candidate.progress.custom ?? []).map((m) => m.id)];
    saveProgress({ ...candidate.progress, milestoneOrder: currentOrder.filter((id) => id !== key) });
  }

  function reorderMilestones(newOrder: string[]) {
    if (!candidate) return;
    saveProgress({ ...candidate.progress, milestoneOrder: newOrder });
  }

  function saveStandardNote(key: string, note: string) {
    if (!candidate) return;
    const milestoneNotes = { ...(candidate.progress.milestoneNotes ?? {}), [key]: note };
    saveProgress({ ...candidate.progress, milestoneNotes });
  }

  function saveCustomNote(id: string, note: string) {
    if (!candidate) return;
    const custom = (candidate.progress.custom ?? []).map((m) => m.id === id ? { ...m, notes: note } : m);
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
  const milestoneOrder = candidate.progress.milestoneOrder ??
    [...progressSteps.map((s) => s.key), ...customMilestones.map((m) => m.id)];
  const progressCount = milestoneOrder.filter((id) => {
    const step = progressSteps.find((s) => s.key === id);
    if (step) return !!candidate.progress[step.key as keyof typeof candidate.progress];
    return customMilestones.find((m) => m.id === id)?.done ?? false;
  }).length;
  const totalMilestones = milestoneOrder.length;
  const pct = totalMilestones > 0 ? Math.round((progressCount / totalMilestones) * 100) : 0;
  const activities = candidate.activities ?? [];
  const jobCount = activities.filter((a) => a.type === "job").length;
  const eventCount = activities.filter((a) => a.type === "event").length;
  const networkCount = activities.filter((a) => a.type === "network").length;

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <div className="flex items-start gap-3">
        <Link href={backHref} className="mt-1 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <PageHeader title={candidate.candidateName} description={`${candidate.clientName} · ${candidate.partner}`}>
            <button onClick={() => setShowSchedule(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
              <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
              <span className="hidden sm:inline">Schedule Session</span>
              <span className="sm:hidden">Schedule</span>
            </button>
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </PageHeader>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Left col */}
        <div className="col-span-1 space-y-4 sm:space-y-5 lg:col-span-2">
          {/* Status & Meta */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
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
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-4 sm:grid-cols-3">
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
            milestoneOrder={milestoneOrder}
            customMilestones={customMilestones}
            onToggleStandard={toggleProgress}
            onAddCustom={addCustomMilestone}
            onToggleCustom={toggleCustomMilestone}
            onRemoveCustom={removeCustomMilestone}
            onRemoveStandard={removeStandardMilestone}
            onReorder={reorderMilestones}
            onSaveStandardNote={saveStandardNote}
            onSaveCustomNote={saveCustomNote}
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
            onEdit={(session) => setEditSession(session)}
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

          {/* Goals */}
          <GoalsManager candidateId={candidate.id} />

          {/* Resources */}
          <ResourceManager candidateId={candidate.id} />

          {/* Activity Log */}
          <CandidateActivityLog logs={activityLog} />
        </div>

        {/* Right col: Contact + Program */}
        <div className="space-y-4 lg:col-span-1">
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
                <a href={candidate.linkedin.startsWith("http") ? candidate.linkedin : `https://${candidate.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:underline">
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

          {isAdmin && (
            <AdminPanel
              candidate={candidate}
              onUpdated={(updates) => setCandidate((prev) => prev ? { ...prev, ...updates } : prev)}
            />
          )}

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
      {editSession && (
        <ScheduleModal
          candidate={candidate}
          initialSession={editSession}
          mode="edit"
          onClose={() => setEditSession(null)}
          onSaved={() => { setEditSession(null); load(); }}
        />
      )}
    </div>
  );
}

/* ─── Sessions List ─── */
function SessionsList({
  sessions, onDelete, onEdit, onSchedule,
}: {
  sessions: Session[];
  onDelete: (id: string) => void;
  onEdit: (session: Session) => void;
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
                  <SessionRow key={s.id} session={s} formatDate={formatDate} formatDuration={formatDuration} onDelete={onDelete} onEdit={onEdit} isUpcoming />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Past</p>
              <div className="space-y-2">
                {past.map((s) => (
                  <SessionRow key={s.id} session={s} formatDate={formatDate} formatDuration={formatDuration} onDelete={onDelete} onEdit={onEdit} isUpcoming={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SessionRow({ session, formatDate, formatDuration, onDelete, onEdit, isUpcoming }: {
  session: Session;
  formatDate: (d: string, t: string) => string;
  formatDuration: (m: number) => string;
  onDelete: (id: string) => void;
  onEdit: (session: Session) => void;
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
      <div className="ml-2 flex shrink-0 items-center gap-1">
        <button onClick={() => onEdit(session)}
          className="text-muted-foreground/50 hover:text-primary transition-colors"
          title="Edit session">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(session.id)}
          className="text-muted-foreground/30 hover:text-rose-400 transition-colors"
          title="Delete session">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Milestones Panel ─── */
function MilestonesPanel({
  candidate, progressCount, totalMilestones, pct, milestoneOrder, customMilestones,
  onToggleStandard, onAddCustom, onToggleCustom, onRemoveCustom, onRemoveStandard, onReorder,
  onSaveStandardNote, onSaveCustomNote,
}: {
  candidate: Candidate;
  progressCount: number;
  totalMilestones: number;
  pct: number;
  milestoneOrder: string[];
  customMilestones: CustomMilestone[];
  onToggleStandard: (key: string) => void;
  onAddCustom: (label: string) => void;
  onToggleCustom: (id: string) => void;
  onRemoveCustom: (id: string) => void;
  onRemoveStandard: (key: string) => void;
  onReorder: (newOrder: string[]) => void;
  onSaveStandardNote: (key: string, note: string) => void;
  onSaveCustomNote: (id: string, note: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleAdd() {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    onAddCustom(trimmed);
    setNewLabel("");
    setShowAdd(false);
  }

  function openNote(key: string, current: string) {
    setOpenNotes(key);
    setNoteDraft(current);
  }

  function saveNote(key: string, isCustom: boolean) {
    if (isCustom) onSaveCustomNote(key, noteDraft);
    else onSaveStandardNote(key, noteDraft);
    setOpenNotes(null);
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (id !== dragId) setDragOverId(id);
  }

  function handleDrop(id: string) {
    if (!dragId || dragId === id) { setDragId(null); setDragOverId(null); return; }
    const from = milestoneOrder.indexOf(dragId);
    const to = milestoneOrder.indexOf(id);
    if (from === -1 || to === -1) { setDragId(null); setDragOverId(null); return; }
    const next = [...milestoneOrder];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    onReorder(next);
    setDragId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDragId(null);
    setDragOverId(null);
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
        {milestoneOrder.map((id) => {
          const step = progressSteps.find((s) => s.key === id);
          const custom = customMilestones.find((m) => m.id === id);
          if (!step && !custom) return null;

          const isCustom = !!custom;
          const done = isCustom ? custom!.done : !!candidate.progress[id as keyof typeof candidate.progress];
          const note = isCustom ? (custom!.notes ?? "") : (candidate.progress.milestoneNotes?.[id] ?? "");
          const isNoteOpen = openNotes === id;
          const isDragging = dragId === id;
          const isDragOver = dragOverId === id;

          return (
            <div
              key={id}
              draggable
              onDragStart={() => handleDragStart(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "rounded-lg border overflow-hidden group transition-all",
                isCustom ? "border-dashed border-border" : "border-border",
                isDragging ? "opacity-40" : "opacity-100",
                isDragOver ? "ring-2 ring-primary/50" : "",
              )}
            >
              <div className="flex w-full items-center gap-2 px-3 py-3 hover:bg-sidebar-accent transition-colors">
                <span className="shrink-0 cursor-grab text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </span>
                <button
                  onClick={() => isCustom ? onToggleCustom(id) : onToggleStandard(id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    done
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCustom ? "bg-violet-500/10 text-violet-400" : "bg-muted text-muted-foreground")}>
                    {isCustom ? <Flag className="h-3.5 w-3.5" /> : milestoneOrder.filter((oid) => progressSteps.some((s) => s.key === oid)).indexOf(id) + 1}
                  </div>
                  {done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <Circle className="h-5 w-5 shrink-0 text-muted-foreground/40" />}
                  <span className={cn("text-sm font-medium", done ? "text-foreground line-through decoration-muted-foreground/40" : "text-foreground")}>
                    {isCustom ? custom!.label : step!.label}
                  </span>
                </button>
                <span className="text-xs text-muted-foreground shrink-0">{done ? "Complete" : "Pending"}</span>
                <button
                  onClick={() => isNoteOpen ? setOpenNotes(null) : openNote(id, note)}
                  className={cn("shrink-0 transition-colors", note ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground")}
                  title="Add note"
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  onClick={() => isCustom ? onRemoveCustom(id) : onRemoveStandard(id)}
                  className="shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
                  title="Remove milestone"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {isNoteOpen && (
                <div className="border-t border-border bg-sidebar/30 px-4 py-3 space-y-2">
                  <textarea
                    autoFocus
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={2}
                    placeholder="Add a note for this milestone…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                    onKeyDown={(e) => { if (e.key === "Escape") setOpenNotes(null); if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveNote(id, isCustom); }}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setOpenNotes(null)} className="rounded px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
                    <button onClick={() => saveNote(id, isCustom)} className="rounded px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Save</button>
                  </div>
                  {note && !noteDraft && <p className="text-xs text-muted-foreground italic">Note will be cleared on save.</p>}
                </div>
              )}
              {note && !isNoteOpen && (
                <div className="border-t border-border bg-sidebar/20 px-4 py-2">
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{note}</p>
                </div>
              )}
            </div>
          );
        })}

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

/* ─── Admin Panel ─── */
const INVOICE_OPTIONS: InvoiceStatus[] = ["Not Raised", "Raised", "Cleared"];
const COSTING_OPTIONS: CostingStatus[] = ["Not Done", "To be reviewed", "Done"];

const invoiceColors: Record<InvoiceStatus, string> = {
  Cleared: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
  Raised: "bg-amber-500/20 text-amber-400",
  "Not Raised": "bg-rose-500/20 text-rose-400",
};
const costingColors: Record<CostingStatus, string> = {
  Done: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40",
  "To be reviewed": "bg-amber-500/20 text-amber-400",
  "Not Done": "bg-rose-500/20 text-rose-400",
};

function AdminPanel({
  candidate,
  onUpdated,
}: {
  candidate: Candidate;
  onUpdated: (updates: Partial<Candidate>) => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(candidate.adminNotes ?? "");
  const [saving, setSaving] = useState(false);

  async function patchCandidate(updates: Partial<Candidate>) {
    setSaving(true);
    await fetch(`/api/candidates/${candidate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    onUpdated(updates);
    setSaving(false);
  }

  async function saveNotes() {
    await patchCandidate({ adminNotes: notesDraft });
    setEditingNotes(false);
  }

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
        <h2 className="font-semibold text-amber-400 text-sm">Admin</h2>
      </div>

      <div className="space-y-3">
        {/* DiSC */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">DiSC</span>
          {candidate.discStyle
            ? <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">Done · {candidate.discStyle}</span>
            : <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">Not Done</span>
          }
        </div>

        {/* Invoice */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Invoice</span>
          <select
            value={candidate.invoiceStatus}
            disabled={saving}
            onChange={(e) => patchCandidate({ invoiceStatus: e.target.value as InvoiceStatus })}
            className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer focus:outline-none disabled:opacity-60", invoiceColors[candidate.invoiceStatus])}
          >
            {INVOICE_OPTIONS.map((o) => <option key={o} value={o} className="bg-card text-foreground">{o}</option>)}
          </select>
        </div>

        {/* Costing */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Costing</span>
          <select
            value={candidate.costingStatus}
            disabled={saving}
            onChange={(e) => patchCandidate({ costingStatus: e.target.value as CostingStatus })}
            className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer focus:outline-none disabled:opacity-60", costingColors[candidate.costingStatus])}
          >
            {COSTING_OPTIONS.map((o) => <option key={o} value={o} className="bg-card text-foreground">{o}</option>)}
          </select>
        </div>

        {/* Budget */}
        {candidate.budget ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">Budget</span>
            <span className="text-xs font-medium text-foreground">{candidate.budgetCurrency ?? "AED"} {candidate.budget.toLocaleString()}</span>
          </div>
        ) : null}

        {/* Admin Notes */}
        <div className="pt-2 border-t border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/70">Admin Notes</span>
            {!editingNotes && (
              <button
                onClick={() => { setNotesDraft(candidate.adminNotes ?? ""); setEditingNotes(true); }}
                className="text-[10px] text-amber-500/60 hover:text-amber-400 transition-colors border border-amber-500/30 rounded px-2 py-0.5"
              >
                {candidate.adminNotes ? "Edit" : "+ Add"}
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={3}
                placeholder="Internal notes visible only to admins…"
                className="w-full rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveNotes();
                  if (e.key === "Escape") setEditingNotes(false);
                }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingNotes(false)} className="rounded px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
                <button onClick={saveNotes} disabled={saving} className="rounded px-2.5 py-1 text-[10px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : candidate.adminNotes ? (
            <p className="text-xs text-amber-300/80 leading-relaxed whitespace-pre-wrap">{candidate.adminNotes}</p>
          ) : (
            <p className="text-xs text-muted-foreground/40 italic">No admin notes yet.</p>
          )}
        </div>
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
