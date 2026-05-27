"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
  ShieldCheck, AlertCircle, Clock, X, MessageCircle, ExternalLink,
  CheckCircle2, Circle, ChevronRight,
} from "lucide-react";
import { Candidate, InvoiceStatus, CostingStatus } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const invoiceColors: Record<InvoiceStatus, string> = {
  Cleared: "bg-emerald-500/20 text-white border border-emerald-500",
  Raised: "bg-amber-500/20 text-white",
  "Not Raised": "bg-rose-500/20 text-white",
};

const costingColors: Record<CostingStatus, string> = {
  Done: "bg-emerald-500/20 text-white border border-emerald-500",
  "To be reviewed": "bg-amber-500/20 text-white",
  "Not Done": "bg-rose-500/20 text-white",
};

const INVOICE_OPTIONS: InvoiceStatus[] = ["Not Raised", "Raised", "Cleared"];
const COSTING_OPTIONS: CostingStatus[] = ["Not Done", "To be reviewed", "Done"];

const statusColorMap: Record<string, string> = {
  referred: "bg-violet-500/20 text-violet-400",
  candidate_reached: "bg-sky-500/20 text-sky-400",
  active: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-blue-500/20 text-blue-400",
  declined: "bg-rose-500/20 text-rose-400",
};

const progressSteps = [
  { key: "introductorySession", label: "Introductory Session" },
  { key: "cvSessions", label: "CV Sessions" },
  { key: "linkedinProfile", label: "LinkedIn & Profile" },
  { key: "profiling", label: "Profiling (DiSC)" },
  { key: "networkingPersonalBranding", label: "Networking & Personal Branding" },
];

export default function CandidateManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderResult, setReminderResult] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Candidate | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [adminDraft, setAdminDraft] = useState("");
  const [editingAdmin, setEditingAdmin] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") router.push("/outplacement");
  }, [session, status, router]);

  async function load() {
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        console.error("[load candidates]", err);
        setLoading(false);
        return;
      }
      setCandidates(await res.json());
    } catch (err) {
      console.error("[load candidates]", err);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Close panel on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setSelectedId(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Fetch full profile when a row is selected
  useEffect(() => {
    if (!selectedId) { setProfile(null); return; }
    setProfileLoading(true);
    fetch(`/api/candidates/${selectedId}`)
      .then((r) => r.json())
      .then((data) => { setProfile(data); setAdminDraft(data.adminNotes ?? ""); })
      .finally(() => setProfileLoading(false));
  }, [selectedId]);

  async function updateField(id: string, field: string, value: string) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    await fetch(`/api/candidates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function saveAdminNotes() {
    if (!profile) return;
    setProfile({ ...profile, adminNotes: adminDraft });
    setEditingAdmin(false);
    await fetch(`/api/candidates/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: adminDraft }),
    });
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.role !== "admin") return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Candidate Management"
        description="Billing, invoicing, and program tracking — visible to admins only."
      >
        <div />
      </PageHeader>

      {reminderResult && (
        <div className={cn(
          "rounded-lg border px-4 py-3 text-sm",
          reminderResult.includes("sent") || reminderResult.includes("No pending")
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
        )}>
          {reminderResult}
        </div>
      )}

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryPill label="DiSC Pending" value={candidates.filter((c) => !c.discStyle).length} color="text-rose-400" icon={Clock} />
        <SummaryPill label="Invoice Not Raised" value={candidates.filter((c) => c.invoiceStatus === "Not Raised").length} color="text-amber-400" icon={AlertCircle} />
        <SummaryPill label="Costing Pending" value={candidates.filter((c) => c.costingStatus === "Not Done").length} color="text-rose-400" icon={Clock} />
      </div>

      {/* Table + slide-over */}
      <div className="relative flex gap-0 overflow-hidden rounded-xl border border-border bg-card">
        {/* Table */}
        <div className={cn("flex-1 overflow-x-auto transition-all duration-300", selectedId ? "min-w-0" : "")}>
          <div className="flex items-center gap-2 border-b border-border bg-sidebar/50 px-4 py-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">All Candidates — Admin View</span>
            <span className="ml-auto text-xs text-muted-foreground">{candidates.length} total</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sidebar/30">
                {["Candidate", "Partner", "Client", "Level", "Status", "Start Date", "End Date", "DiSC", "Invoice", "Costing", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedId((prev) => prev === c.id ? null : c.id)}
                  className={cn(
                    "group cursor-pointer transition-colors",
                    selectedId === c.id
                      ? "bg-primary/10"
                      : "hover:bg-sidebar-accent/40"
                  )}
                >
                  <td className="px-4 py-3">
                    <p className={cn("font-medium whitespace-nowrap transition-colors", selectedId === c.id ? "text-primary" : "text-foreground group-hover:text-primary")}>{c.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{c.leadCoach}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{c.partner}</td>
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{c.clientName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-400 whitespace-nowrap">{c.levelOfSupport}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase whitespace-nowrap", statusColorMap[c.status] || "bg-muted text-muted-foreground")}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {c.dateStarted ? new Date(c.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {c.endDate ? new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.discStyle
                      ? <span className="rounded-full bg-emerald-500/20 border border-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">Done</span>
                      : <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">Not Done</span>
                    }
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect value={c.invoiceStatus} options={INVOICE_OPTIONS} colorMap={invoiceColors} onChange={(v) => updateField(c.id, "invoiceStatus", v)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect value={c.costingStatus} options={COSTING_OPTIONS} colorMap={costingColors} onChange={(v) => updateField(c.id, "costingStatus", v)} />
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="truncate text-xs text-muted-foreground" title={c.notes}>{c.notes || "—"}</p>
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight className={cn("h-4 w-4 transition-all", selectedId === c.id ? "text-primary rotate-90" : "text-muted-foreground/30 group-hover:text-muted-foreground")} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Slide-over panel */}
        <div className={cn(
          "border-l border-border bg-card flex-shrink-0 overflow-y-auto transition-all duration-300",
          selectedId ? "w-[380px]" : "w-0 border-l-0"
        )}>
          {selectedId && (
            profileLoading || !profile ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <ProfilePanel
                profile={profile}
                adminDraft={adminDraft}
                editingAdmin={editingAdmin}
                onAdminDraftChange={setAdminDraft}
                onEditAdmin={() => setEditingAdmin(true)}
                onCancelAdmin={() => { setEditingAdmin(false); setAdminDraft(profile.adminNotes ?? ""); }}
                onSaveAdmin={saveAdminNotes}
                onClose={() => setSelectedId(null)}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Profile Panel ─── */
function ProfilePanel({
  profile, adminDraft, editingAdmin,
  onAdminDraftChange, onEditAdmin, onCancelAdmin, onSaveAdmin, onClose,
}: {
  profile: Candidate;
  adminDraft: string;
  editingAdmin: boolean;
  onAdminDraftChange: (v: string) => void;
  onEditAdmin: () => void;
  onCancelAdmin: () => void;
  onSaveAdmin: () => void;
  onClose: () => void;
}) {
  const standardDone = [
    profile.progress?.introductorySession,
    profile.progress?.cvSessions,
    profile.progress?.linkedinProfile,
    profile.progress?.profiling,
    profile.progress?.networkingPersonalBranding,
  ].filter(Boolean).length;
  const customDone = (profile.progress?.custom ?? []).filter((m) => m.done).length;
  const done = standardDone + customDone;
  const total = 5 + (profile.progress?.custom?.length ?? 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 shrink-0">
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{profile.candidateName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{profile.clientName} · {profile.partner}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/outplacement/candidates/${profile.id}?from=admin`}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Open full profile"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Full profile
          </Link>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase", {
            "bg-violet-500/20 text-violet-400": profile.status === "referred",
            "bg-sky-500/20 text-sky-400": profile.status === "candidate_reached",
            "bg-emerald-500/20 text-emerald-400": profile.status === "active",
            "bg-blue-500/20 text-blue-400": profile.status === "completed",
            "bg-rose-500/20 text-rose-400": profile.status === "declined",
          })}>
            {profile.status.replace("_", " ")}
          </span>
          {profile.levelOfSupport && (
            <span className="rounded-full bg-violet-500/20 px-2.5 py-1 text-[11px] font-semibold text-violet-400">
              {profile.levelOfSupport} Support
            </span>
          )}
          {profile.discStyle && (
            <span className="rounded-full bg-primary/20 px-2.5 py-1 text-[11px] font-semibold text-primary">
              DiSC: {profile.discStyle}
            </span>
          )}
        </div>

        {/* Key info */}
        <div className="rounded-xl border border-border bg-sidebar/30 p-4 space-y-3">
          <Row label="Lead Coach" value={profile.leadCoach} />
          <Row label="Support" value={profile.support} />
          <Row label="Duration" value={profile.duration} />
          <Row label="Start Date" value={profile.dateStarted ? new Date(profile.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
          <Row label="End Date" value={profile.endDate ? new Date(profile.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
          <Row label="Sessions" value={`${profile.sessionsCompleted ?? 0} completed`} />
          {profile.budget ? <Row label="Budget" value={`${profile.budgetCurrency ?? "AED"} ${profile.budget.toLocaleString()}`} /> : null}
        </div>

        {/* Contact */}
        {(profile.email || profile.whatsapp || profile.linkedin) && (
          <div className="rounded-xl border border-border bg-sidebar/30 p-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contact</p>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-xs text-primary hover:underline">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" /> {profile.email}
              </a>
            )}
            {profile.whatsapp && (
              <a href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-green-400 hover:underline">
                <MessageCircle className="h-3.5 w-3.5 shrink-0" /> {profile.whatsapp}
              </a>
            )}
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-blue-400 hover:underline truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" /> LinkedIn
              </a>
            )}
          </div>
        )}

        {/* Program Progress */}
        <div className="rounded-xl border border-border bg-sidebar/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Program Progress</p>
            <span className="text-xs text-muted-foreground">{done}/{total} · {pct}%</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-1.5">
            {progressSteps.map((step) => {
              const isDone = !!profile.progress?.[step.key as keyof typeof profile.progress];
              return (
                <div key={step.key} className="flex items-center gap-2">
                  {isDone
                    ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />}
                  <span className={cn("text-xs", isDone ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
                </div>
              );
            })}
            {(profile.progress?.custom ?? []).map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                {m.done
                  ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  : <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />}
                <span className={cn("text-xs", m.done ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {profile.notes && (
          <div className="rounded-xl border border-border bg-sidebar/30 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.notes}</p>
          </div>
        )}

        {/* Admin Notes */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🔒</span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Admin Notes</p>
            </div>
            {!editingAdmin && (
              <button onClick={onEditAdmin} className="text-[10px] text-amber-500/60 hover:text-amber-400 transition-colors border border-amber-500/30 rounded px-2 py-0.5">
                {profile.adminNotes ? "Edit" : "+ Add"}
              </button>
            )}
          </div>
          {editingAdmin ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={adminDraft}
                onChange={(e) => onAdminDraftChange(e.target.value)}
                rows={4}
                placeholder="Internal notes visible only to admins…"
                className="w-full rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSaveAdmin();
                  if (e.key === "Escape") onCancelAdmin();
                }}
              />
              <div className="flex gap-2 justify-end">
                <button onClick={onCancelAdmin} className="rounded px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground border border-border transition-colors">Cancel</button>
                <button onClick={onSaveAdmin} className="rounded px-2.5 py-1 text-[10px] font-semibold bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-colors">Save</button>
              </div>
            </div>
          ) : profile.adminNotes ? (
            <p className="text-xs text-amber-300/80 leading-relaxed whitespace-pre-wrap">{profile.adminNotes}</p>
          ) : (
            <p className="text-xs text-muted-foreground/40 italic">No admin notes yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value || "—"}</span>
    </div>
  );
}

function InlineSelect<T extends string>({ value, options, colorMap, onChange }: { value: T; options: T[]; colorMap: Record<T, string>; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer focus:outline-none", colorMap[value] || "bg-muted text-muted-foreground")}
    >
      {options.map((o) => <option key={o} value={o} style={{ backgroundColor: "rgba(255,255,255,0.85)", color: "black" }}>{o}</option>)}
    </select>
  );
}

function SummaryPill({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <Icon className={cn("h-5 w-5", color)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-xl font-bold", color)}>{value}</p>
      </div>
    </div>
  );
}
