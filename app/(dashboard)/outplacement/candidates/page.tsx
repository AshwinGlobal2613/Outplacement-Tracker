"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ExternalLink, CheckCircle2, XCircle, Clock, UserCheck, Send } from "lucide-react";
import { Candidate, CandidateStatus } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CandidateModal } from "@/components/outplacement/candidate-modal";

const supportColors: Record<string, string> = {
  Low: "bg-slate-500/20 text-slate-400",
  "Low-Mid": "bg-cyan-500/20 text-cyan-400",
  Mid: "bg-violet-500/20 text-violet-400",
  "Mid-High": "bg-orange-500/20 text-orange-400",
  High: "bg-rose-500/20 text-rose-400",
};

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: "referred", label: "Referred" },
  { value: "candidate_reached", label: "Candidate Reached" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "declined", label: "Declined" },
];

const statusSelectColors: Record<CandidateStatus, string> = {
  referred: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  candidate_reached: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  active: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  completed: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  declined: "text-rose-400 border-rose-500/40 bg-rose-500/10",
};

async function updateCandidateStatus(id: string, status: CandidateStatus) {
  await fetch(`/api/candidates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

function StatusSelect({ candidate, onChanged }: { candidate: Candidate; onChanged: () => void }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    e.stopPropagation();
    setSaving(true);
    await updateCandidateStatus(candidate.id, e.target.value as CandidateStatus);
    setSaving(false);
    onChanged();
  }

  return (
    <select
      value={candidate.status}
      onChange={handleChange}
      disabled={saving}
      onClick={(e) => e.preventDefault()}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer disabled:opacity-60",
        statusSelectColors[candidate.status as CandidateStatus] ?? "text-muted-foreground border-border bg-card"
      )}
    >
      {statusOptions.map((o) => (
        <option key={o.value} value={o.value} className="bg-card text-foreground">
          {o.label}
        </option>
      ))}
    </select>
  );
}

const tabs: { key: CandidateStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: "referred", label: "Referred", icon: Send, color: "text-violet-400" },
  { key: "candidate_reached", label: "Candidate Reached", icon: UserCheck, color: "text-sky-400" },
  { key: "active", label: "Active", icon: Clock, color: "text-emerald-400" },
  { key: "completed", label: "Completed", icon: CheckCircle2, color: "text-blue-400" },
  { key: "declined", label: "Declined", icon: XCircle, color: "text-rose-400" },
];

function CandidatesContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<CandidateStatus>(
    (searchParams.get("tab") as CandidateStatus) ?? "active"
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    const res = await fetch("/api/candidates");
    setCandidates(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const counts = Object.fromEntries(
    tabs.map((t) => [t.key, candidates.filter((c) => c.status === t.key).length])
  ) as Record<CandidateStatus, number>;

  const filtered = candidates.filter((c) => {
    if (c.status !== activeTab) return false;
    const q = search.toLowerCase();
    return (
      !q ||
      c.candidateName.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.partner.toLowerCase().includes(q) ||
      c.leadCoach.toLowerCase().includes(q)
    );
  });

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Candidates"
        description={tabs.map((t) => `${counts[t.key]} ${t.label.toLowerCase()}`).join(" · ")}
      >
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Add Candidate
          </button>
        )}
      </PageHeader>

      {/* Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1">
          {tabs.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", activeTab === key ? "text-primary-foreground" : color)} />
              {label}
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                activeTab === key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates, clients, coaches…"
            className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Section label */}
      <div className="flex items-center gap-3">
        <currentTab.icon className={cn("h-5 w-5", currentTab.color)} />
        <h2 className="text-base font-semibold text-foreground">{currentTab.label} Candidates</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : activeTab === "active" ? (
        <ActiveTable candidates={filtered} supportColors={supportColors} onRefresh={load} />
      ) : activeTab === "completed" ? (
        <CompletedTable candidates={filtered} onRefresh={load} />
      ) : activeTab === "declined" ? (
        <DeclinedTable candidates={filtered} onRefresh={load} />
      ) : (
        <SimpleTable candidates={filtered} supportColors={supportColors} onRefresh={load} />
      )}

      {showModal && (
        <CandidateModal
          isAdmin={isAdmin}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <CandidatesContent />
    </Suspense>
  );
}

/* ─── Referred + Candidate Reached (simple table) ─── */
function SimpleTable({ candidates, supportColors, onRefresh }: { candidates: Candidate[]; supportColors: Record<string, string>; onRefresh: () => void }) {
  if (candidates.length === 0) return <EmptyState message="No candidates in this status" />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-sidebar/50">
            <Th>Candidate</Th>
            <Th>Client / Partner</Th>
            <Th>Lead Coach</Th>
            <Th>Support</Th>
            <Th>Level</Th>
            <Th>Status</Th>
            <Th>Date Added</Th>
            <Th>Notes</Th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((c) => (
            <tr key={c.id} className="group transition-colors hover:bg-sidebar-accent/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.candidateName} color="violet" />
                  <div>
                    <p className="font-medium text-foreground">{c.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-foreground">{c.clientName}</p>
                <p className="text-xs text-muted-foreground">{c.partner}</p>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach || "—"}</td>
              <td className="px-4 py-3 text-sm text-foreground">{c.support || "—"}</td>
              <td className="px-4 py-3">
                {c.levelOfSupport && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", supportColors[c.levelOfSupport])}>
                    {c.levelOfSupport}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusSelect candidate={c} onChanged={onRefresh} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
              </td>
              <td className="px-4 py-3 max-w-[180px]">
                <p className="truncate text-xs text-muted-foreground">{c.notes || "—"}</p>
              </td>
              <td className="px-4 py-3">
                <Link href={`/outplacement/candidates/${c.id}?from=${activeTab}`} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Active candidates table ─── */
function ActiveTable({ candidates, supportColors, onRefresh }: { candidates: Candidate[]; supportColors: Record<string, string>; onRefresh: () => void }) {
  if (candidates.length === 0) return <EmptyState message="No active candidates" />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-sidebar/50">
            <Th>Candidate</Th>
            <Th>Client / Partner</Th>
            <Th>Lead Coach</Th>
            <Th>Support</Th>
            <Th>Progress</Th>
            <Th>Sessions</Th>
            <Th>Level</Th>
            <Th>Status</Th>
            <Th>End Date</Th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((c) => {
            const done = Object.values(c.progress).filter(Boolean).length;
            const pct = Math.round((done / 5) * 100);
            return (
              <tr key={c.id} className="group transition-colors hover:bg-sidebar-accent/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.candidateName} color="emerald" />
                    <div>
                      <p className="font-medium text-foreground">{c.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{c.clientName}</p>
                  <p className="text-xs text-muted-foreground">{c.partner}</p>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach}</td>
                <td className="px-4 py-3 text-sm text-foreground">{c.support}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{done}/5 milestones</p>
                </td>
                <td className="px-4 py-3 text-center text-sm text-foreground">{c.sessionsCompleted}</td>
                <td className="px-4 py-3">
                  {c.levelOfSupport && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", supportColors[c.levelOfSupport])}>
                      {c.levelOfSupport}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect candidate={c} onChanged={onRefresh} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {c.endDate ? new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/outplacement/candidates/${c.id}?from=${activeTab}`} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Completed candidates table ─── */
function CompletedTable({ candidates, onRefresh }: { candidates: Candidate[]; onRefresh: () => void }) {
  const placed = candidates.filter((c) => c.jobStatus === "Y").length;
  if (candidates.length === 0) return <EmptyState message="No completed candidates yet" />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Total Completed" value={candidates.length} color="text-foreground" />
        <StatPill label="Successfully Placed" value={placed} color="text-emerald-400" />
        <StatPill label="Placement Rate" value={`${candidates.length > 0 ? Math.round((placed / candidates.length) * 100) : 0}%`} color="text-primary" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar/50">
              <Th>Candidate</Th>
              <Th>From</Th>
              <Th>New Company / Placement</Th>
              <Th>New Job Title</Th>
              <Th>Lead Coach</Th>
              <Th>DiSC</Th>
              <Th>Status</Th>
              <Th>Placed</Th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => (
              <tr key={c.id} className="group transition-colors hover:bg-sidebar-accent/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.candidateName} color="blue" />
                    <div>
                      <p className="font-medium text-foreground">{c.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{c.partner}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.oldPlacement || c.clientName}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{c.newPlacement || c.newCompany || "—"}</p>
                  {c.sector && <p className="text-xs text-muted-foreground">{c.sector}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{c.position || "—"}</td>
                <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach}</td>
                <td className="px-4 py-3">
                  {c.discStyle
                    ? <span className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">{c.discStyle}</span>
                    : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3">
                  <StatusSelect candidate={c} onChanged={onRefresh} />
                </td>
                <td className="px-4 py-3">
                  {c.jobStatus === "Y"
                    ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Placed</span>
                    : <span className="text-xs text-muted-foreground">Pending</span>}
                </td>
                <td className="px-4 py-3">
                  <Link href={`/outplacement/candidates/${c.id}?from=${activeTab}`} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Declined candidates table ─── */
function DeclinedTable({ candidates, onRefresh }: { candidates: Candidate[]; onRefresh: () => void }) {
  if (candidates.length === 0) return <EmptyState message="No declined candidates" />;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-sidebar/50">
            <Th>Candidate</Th>
            <Th>Client / Partner</Th>
            <Th>Lead Coach</Th>
            <Th>Status</Th>
            <Th>Date Started</Th>
            <Th>Notes</Th>
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((c) => (
            <tr key={c.id} className="group transition-colors hover:bg-sidebar-accent/40">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={c.candidateName} color="rose" />
                  <div>
                    <p className="font-medium text-foreground">{c.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-foreground">{c.clientName}</p>
                <p className="text-xs text-muted-foreground">{c.partner}</p>
              </td>
              <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach}</td>
              <td className="px-4 py-3">
                <StatusSelect candidate={c} onChanged={onRefresh} />
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {c.dateStarted ? new Date(c.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{c.notes || "—"}</td>
              <td className="px-4 py-3">
                <Link href={`/outplacement/candidates/${c.id}?from=${activeTab}`} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Shared helpers ─── */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

function Avatar({ name, color }: { name: string; color: "emerald" | "blue" | "rose" | "violet" }) {
  const colorMap = {
    emerald: "bg-emerald-500/20 text-emerald-400",
    blue: "bg-blue-500/20 text-blue-400",
    rose: "bg-rose-500/20 text-rose-400",
    violet: "bg-violet-500/20 text-violet-400",
  };
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold", colorMap[color])}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-2xl font-bold", color)}>{value}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
