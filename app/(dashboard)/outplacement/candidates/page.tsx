"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ExternalLink, CheckCircle2, XCircle, Clock, UserCheck, Send, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Candidate, CandidateStatus, Lists } from "@/lib/types";
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
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
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

const SUPPORT_LEVELS = ["Low", "Low-Mid", "Mid", "Mid-High", "High"];

function CandidatesContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [lists, setLists] = useState<Lists>({ partners: [], clients: [], coaches: [], supports: [] });
  const [search, setSearch] = useState("");
  const [filterCoach, setFilterCoach] = useState("");
  const [filterSupport, setFilterSupport] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [activeTab, setActiveTab] = useState<CandidateStatus>(
    (searchParams.get("tab") as CandidateStatus) ?? "active"
  );
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/candidates");
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data : []);
    } catch {
      setCandidates([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { fetch("/api/lists").then((r) => r.json()).then(setLists).catch(() => {}); }, []);

  useEffect(() => {
    const tab = searchParams.get("tab") as CandidateStatus | null;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => { setSelectedIds(new Set()); }, [activeTab]);

  const uniqueClients = Array.from(new Set(candidates.map((c) => c.clientName).filter(Boolean))).sort();

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll(ids: string[]) {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }

  async function handleBulkUpdate(newStatus: CandidateStatus) {
    setBulkUpdating(true);
    await Promise.all(Array.from(selectedIds).map((id) => updateCandidateStatus(id, newStatus)));
    setSelectedIds(new Set());
    setBulkUpdating(false);
    load();
  }

  const activeFilterCount = [filterCoach, filterSupport, filterClient, filterLevel].filter(Boolean).length;

  function clearFilters() {
    setFilterCoach("");
    setFilterSupport("");
    setFilterClient("");
    setFilterLevel("");
    setSearch("");
  }

  const counts = Object.fromEntries(
    tabs.map((t) => [t.key, candidates.filter((c) => c.status === t.key).length])
  ) as Record<CandidateStatus, number>;

  const filtered = candidates.filter((c) => {
    if (c.status !== activeTab) return false;
    const q = search.toLowerCase();
    if (q && !c.candidateName.toLowerCase().includes(q) &&
              !c.clientName.toLowerCase().includes(q) &&
              !c.partner.toLowerCase().includes(q) &&
              !c.leadCoach.toLowerCase().includes(q)) return false;
    if (filterCoach && c.leadCoach !== filterCoach) return false;
    if (filterSupport && c.support !== filterSupport) return false;
    if (filterClient && c.clientName !== filterClient) return false;
    if (filterLevel && c.levelOfSupport !== filterLevel) return false;
    return true;
  });

  const currentTab = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
      <PageHeader
        title="Candidates"
        description={tabs.map((t) => `${counts[t.key]} ${t.label.toLowerCase()}`).join(" · ")}
      >
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden xs:inline">Add Candidate</span>
          <span className="xs:hidden">Add</span>
        </button>
      </PageHeader>

      {/* Tabs — scrollable on mobile */}
      <div className="flex flex-col gap-3">
        <div className="flex overflow-x-auto rounded-xl border border-border bg-card p-1 scrollbar-none gap-1">
          {tabs.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", activeTab === key ? "text-primary-foreground" : color)} />
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

        {/* Search + Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {/* Search + filter toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, client, coach…"
                className="w-full sm:w-52 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:hidden",
                (activeFilterCount > 0 || showFilters)
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={cn("h-3 w-3 transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>

          {/* Filter dropdowns — always visible on sm+, collapsible on mobile */}
          <div className={cn(
            "flex flex-wrap items-center gap-1.5",
            "hidden sm:flex",
            showFilters && "!flex"
          )}>
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <FilterSelect value={filterCoach} onChange={setFilterCoach} placeholder="Lead Coach" options={lists.coaches} />
            <FilterSelect value={filterSupport} onChange={setFilterSupport} placeholder="Support" options={lists.supports} />
            <FilterSelect value={filterClient} onChange={setFilterClient} placeholder="Client" options={uniqueClients} />
            <FilterSelect value={filterLevel} onChange={setFilterLevel} placeholder="Level" options={SUPPORT_LEVELS} />
            {(activeFilterCount > 0 || search) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
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
        <ActiveTable candidates={filtered} supportColors={supportColors} onRefresh={load} activeTab={activeTab}
          isAdmin={isAdmin} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleAll={toggleAll} />
      ) : activeTab === "completed" ? (
        <CompletedTable candidates={filtered} onRefresh={load} activeTab={activeTab}
          isAdmin={isAdmin} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleAll={toggleAll} />
      ) : activeTab === "declined" ? (
        <DeclinedTable candidates={filtered} onRefresh={load} activeTab={activeTab}
          isAdmin={isAdmin} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleAll={toggleAll} />
      ) : (
        <SimpleTable candidates={filtered} supportColors={supportColors} onRefresh={load} activeTab={activeTab}
          isAdmin={isAdmin} selectedIds={selectedIds} onToggleSelect={toggleSelect} onToggleAll={toggleAll} />
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          currentStatus={activeTab}
          onApply={handleBulkUpdate}
          onClear={() => setSelectedIds(new Set())}
          loading={bulkUpdating}
        />
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

/* ─── Selection props shared by all tables ─── */
interface SelectionProps {
  isAdmin?: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
}

/* ─── Bulk Action Bar ─── */
function BulkActionBar({ count, currentStatus, onApply, onClear, loading }: {
  count: number;
  currentStatus: CandidateStatus;
  onApply: (s: CandidateStatus) => void;
  onClear: () => void;
  loading: boolean;
}) {
  const [targetStatus, setTargetStatus] = useState<CandidateStatus>(
    statusOptions.find((o) => o.value !== currentStatus)?.value ?? "active"
  );

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-2xl mx-4 sm:gap-3 sm:px-5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
        {count}
      </div>
      <p className="text-sm font-medium text-foreground">
        candidate{count > 1 ? "s" : ""} selected
      </p>
      <div className="mx-1 h-5 w-px bg-border hidden sm:block" />
      <p className="text-xs text-muted-foreground hidden sm:block">Move to</p>
      <select
        value={targetStatus}
        onChange={(e) => setTargetStatus(e.target.value as CandidateStatus)}
        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {statusOptions.filter((o) => o.value !== currentStatus).map((o) => (
          <option key={o.value} value={o.value} className="bg-card">{o.label}</option>
        ))}
      </select>
      <button
        onClick={() => onApply(targetStatus)}
        disabled={loading}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
      >
        {loading ? "Updating…" : "Apply"}
      </button>
      <button onClick={onClear} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        Cancel
      </button>
    </div>
  );
}

/* ─── Referred + Candidate Reached (simple table) ─── */
function SimpleTable({ candidates, supportColors, onRefresh, activeTab, isAdmin, selectedIds, onToggleSelect, onToggleAll }: { candidates: Candidate[]; supportColors: Record<string, string>; onRefresh: () => void; activeTab: string } & SelectionProps) {
  const router = useRouter();
  if (candidates.length === 0) return <EmptyState message="No candidates in this status" />;
  const allIds = candidates.map((c) => c.id);
  const allSelected = allIds.every((id) => selectedIds.has(id));
  return (
    <>
      {/* Card view — shown on everything up to 2xl (laptops included) */}
      <div className="flex flex-col gap-3 2xl:hidden">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} activeTab={activeTab} onRefresh={onRefresh}
            selected={selectedIds.has(c.id)} onToggle={() => onToggleSelect(c.id)}>
            <div className="flex flex-wrap gap-2 mt-2">
              {c.levelOfSupport && (
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", supportColors[c.levelOfSupport])}>
                  {c.levelOfSupport}
                </span>
              )}
              <span className="text-xs text-muted-foreground">Added {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}</span>
            </div>
            {c.notes && <p className="mt-1 text-xs text-muted-foreground truncate">{c.notes}</p>}
            {isAdmin && c.budget && (
              <p className="mt-1 text-xs font-medium text-primary">{c.budgetCurrency ?? "AED"} {c.budget.toLocaleString()}</p>
            )}
          </CandidateCard>
        ))}
      </div>

      {/* Full table — only on 2xl+ (wide monitors ≥ 1536px) */}
      <div className="hidden 2xl:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar/50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(allIds)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <Th>Candidate</Th>
              <Th>Client / Partner</Th>
              <Th>Lead Coach</Th>
              <Th>Support</Th>
              <Th>Level</Th>
              <Th>Status</Th>
              <Th>Date Added</Th>
              <Th>Notes</Th>
              {isAdmin && <Th>Budget</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => (
              <tr key={c.id}
                onClick={() => router.push(`/outplacement/candidates/${c.id}?from=${activeTab}`)}
                className={cn("group cursor-pointer transition-colors hover:bg-sidebar-accent/40", selectedIds.has(c.id) && "bg-primary/5")}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggleSelect(c.id)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.candidateName} color="violet" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{c.candidateName}</p>
                        <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                      </div>
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
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect candidate={c} onChanged={onRefresh} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <p className="truncate text-xs text-muted-foreground">{c.notes || "—"}</p>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {c.budget ? `${c.budgetCurrency ?? "AED"} ${c.budget.toLocaleString()}` : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Active candidates table ─── */
function ActiveTable({ candidates, supportColors, onRefresh, activeTab, isAdmin, selectedIds, onToggleSelect, onToggleAll }: { candidates: Candidate[]; supportColors: Record<string, string>; onRefresh: () => void; activeTab: string } & SelectionProps) {
  const router = useRouter();
  if (candidates.length === 0) return <EmptyState message="No active candidates" />;
  const allIds = candidates.map((c) => c.id);
  const allSelected = allIds.every((id) => selectedIds.has(id));
  return (
    <>
      {/* Card view — shown on everything up to 2xl (laptops included) */}
      <div className="flex flex-col gap-3 2xl:hidden">
        {candidates.map((c) => {
          const p = c.progress;
          const standardDone = [p?.introductorySession, p?.cvSessions, p?.linkedinProfile, p?.profiling, p?.networkingPersonalBranding].filter(Boolean).length;
          const customDone = (p?.custom ?? []).filter((m) => m.done).length;
          const done = standardDone + customDone;
          const total = 5 + (c.progress?.custom?.length ?? 0);
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <CandidateCard key={c.id} candidate={c} activeTab={activeTab} onRefresh={onRefresh}
              selected={selectedIds.has(c.id)} onToggle={() => onToggleSelect(c.id)}>
              {/* Progress bar */}
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{pct}% · {done}/{total}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {c.levelOfSupport && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", supportColors[c.levelOfSupport])}>
                    {c.levelOfSupport}
                  </span>
                )}
                {c.endDate && (
                  <span className="text-xs text-muted-foreground">
                    Ends {new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                  </span>
                )}
                {isAdmin && c.budget && (
                  <span className="text-xs font-medium text-primary">{c.budgetCurrency ?? "AED"} {c.budget.toLocaleString()}</span>
                )}
              </div>
            </CandidateCard>
          );
        })}
      </div>

      {/* Full table — only on 2xl+ (wide monitors ≥ 1536px) */}
      <div className="hidden 2xl:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar/50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(allIds)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <Th>Candidate</Th>
              <Th>Client / Partner</Th>
              <Th>Lead Coach</Th>
              <Th>Support</Th>
              <Th>Progress</Th>
              <Th>Sessions</Th>
              <Th>Level</Th>
              <Th>Status</Th>
              <Th>End Date</Th>
              {isAdmin && <Th>Budget</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => {
              const p = c.progress;
              const standardDone = [p?.introductorySession, p?.cvSessions, p?.linkedinProfile, p?.profiling, p?.networkingPersonalBranding].filter(Boolean).length;
              const customDone = (p?.custom ?? []).filter((m) => m.done).length;
              const done = standardDone + customDone;
              const total = 5 + (c.progress?.custom?.length ?? 0);
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <tr key={c.id}
                  onClick={() => router.push(`/outplacement/candidates/${c.id}?from=${activeTab}`)}
                  className={cn("group cursor-pointer transition-colors hover:bg-sidebar-accent/40", selectedIds.has(c.id) && "bg-primary/5")}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggleSelect(c.id)}
                      className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.candidateName} color="emerald" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-foreground">{c.candidateName}</p>
                          <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                        </div>
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
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{done}/{total} milestones</p>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-foreground">{c.sessionsCompleted}</td>
                  <td className="px-4 py-3">
                    {c.levelOfSupport && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", supportColors[c.levelOfSupport])}>
                        {c.levelOfSupport}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect candidate={c} onChanged={onRefresh} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {c.endDate ? new Date(c.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                      {c.budget ? `${c.budgetCurrency ?? "AED"} ${c.budget.toLocaleString()}` : "—"}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Completed candidates table ─── */
function CompletedTable({ candidates, onRefresh, activeTab, isAdmin, selectedIds, onToggleSelect, onToggleAll }: { candidates: Candidate[]; onRefresh: () => void; activeTab: string } & SelectionProps) {
  const router = useRouter();
  const placed = candidates.filter((c) => c.jobStatus === "Y").length;
  if (candidates.length === 0) return <EmptyState message="No completed candidates yet" />;
  const allIds = candidates.map((c) => c.id);
  const allSelected = allIds.every((id) => selectedIds.has(id));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatPill label="Total Completed" value={candidates.length} color="text-foreground" />
        <StatPill label="Successfully Placed" value={placed} color="text-emerald-400" />
        <StatPill label="Placement Rate" value={`${candidates.length > 0 ? Math.round((placed / candidates.length) * 100) : 0}%`} color="text-primary" />
      </div>

      {/* Card view — shown on everything up to 2xl (laptops included) */}
      <div className="flex flex-col gap-3 2xl:hidden">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} activeTab={activeTab} onRefresh={onRefresh}
            selected={selectedIds.has(c.id)} onToggle={() => onToggleSelect(c.id)}>
            {c.newPlacement && (
              <p className="mt-1 text-xs font-medium text-foreground">→ {c.newPlacement}{c.position ? ` · ${c.position}` : ""}</p>
            )}
            {c.sector && <p className="text-xs text-muted-foreground">{c.sector}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {c.jobStatus === "Y"
                ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" /> Placed</span>
                : <span className="text-xs text-muted-foreground">Pending</span>}
              {isAdmin && c.budget && (
                <span className="text-xs font-medium text-primary">{c.budgetCurrency ?? "AED"} {c.budget.toLocaleString()}</span>
              )}
            </div>
          </CandidateCard>
        ))}
      </div>

      <div className="hidden 2xl:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar/50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(allIds)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <Th>Candidate</Th>
              <Th>From</Th>
              <Th>New Company / Placement</Th>
              <Th>New Job Title</Th>
              <Th>Lead Coach</Th>
              <Th>DiSC</Th>
              <Th>Status</Th>
              <Th>Placed</Th>
              {isAdmin && <Th>Budget</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => (
              <tr key={c.id}
                onClick={() => router.push(`/outplacement/candidates/${c.id}?from=${activeTab}`)}
                className={cn("group cursor-pointer transition-colors hover:bg-sidebar-accent/40", selectedIds.has(c.id) && "bg-primary/5")}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggleSelect(c.id)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.candidateName} color="blue" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{c.candidateName}</p>
                        <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                      </div>
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
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect candidate={c} onChanged={onRefresh} />
                </td>
                <td className="px-4 py-3">
                  {c.jobStatus === "Y"
                    ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Placed</span>
                    : <span className="text-xs text-muted-foreground">Pending</span>}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {c.budget ? `${c.budgetCurrency ?? "AED"} ${c.budget.toLocaleString()}` : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Declined candidates table ─── */
function DeclinedTable({ candidates, onRefresh, activeTab, isAdmin, selectedIds, onToggleSelect, onToggleAll }: { candidates: Candidate[]; onRefresh: () => void; activeTab: string } & SelectionProps) {
  const router = useRouter();
  if (candidates.length === 0) return <EmptyState message="No declined candidates" />;
  const allIds = candidates.map((c) => c.id);
  const allSelected = allIds.every((id) => selectedIds.has(id));
  return (
    <>
      {/* Card view — shown on everything up to 2xl (laptops included) */}
      <div className="flex flex-col gap-3 2xl:hidden">
        {candidates.map((c) => (
          <CandidateCard key={c.id} candidate={c} activeTab={activeTab} onRefresh={onRefresh}
            selected={selectedIds.has(c.id)} onToggle={() => onToggleSelect(c.id)}>
            {c.notes && <p className="mt-1 text-xs text-muted-foreground truncate">{c.notes}</p>}
            {c.dateStarted && (
              <p className="mt-1 text-xs text-muted-foreground">
                Started {new Date(c.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
              </p>
            )}
            {isAdmin && c.budget && (
              <p className="mt-1 text-xs font-medium text-primary">{c.budgetCurrency ?? "AED"} {c.budget.toLocaleString()}</p>
            )}
          </CandidateCard>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-sidebar/50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={() => onToggleAll(allIds)}
                  className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
              </th>
              <Th>Candidate</Th>
              <Th>Client / Partner</Th>
              <Th>Lead Coach</Th>
              <Th>Status</Th>
              <Th>Date Started</Th>
              <Th>Notes</Th>
              {isAdmin && <Th>Budget</Th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c) => (
              <tr key={c.id}
                onClick={() => router.push(`/outplacement/candidates/${c.id}?from=${activeTab}`)}
                className={cn("group cursor-pointer transition-colors hover:bg-sidebar-accent/40", selectedIds.has(c.id) && "bg-primary/5")}>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggleSelect(c.id)}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.candidateName} color="rose" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{c.candidateName}</p>
                        <ExternalLink className="h-3 w-3 text-primary/40 group-hover:text-primary transition-colors shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-foreground">{c.clientName}</p>
                  <p className="text-xs text-muted-foreground">{c.partner}</p>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect candidate={c} onChanged={onRefresh} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {c.dateStarted ? new Date(c.dateStarted).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{c.notes || "—"}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                    {c.budget ? `${c.budgetCurrency ?? "AED"} ${c.budget.toLocaleString()}` : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Mobile candidate card ─── */
function CandidateCard({ candidate: c, activeTab, onRefresh, selected, onToggle, children }: {
  candidate: Candidate;
  activeTab: string;
  onRefresh: () => void;
  selected: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4 transition-colors",
      selected && "border-primary/50 bg-primary/5"
    )}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle}
          className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-primary cursor-pointer" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={c.candidateName} color="emerald" />
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{c.candidateName}</p>
                {c.clientName && <p className="text-xs text-muted-foreground truncate">{c.clientName}{c.partner ? ` · ${c.partner}` : ""}</p>}
              </div>
            </div>
            <Link
              href={`/outplacement/candidates/${c.id}?from=${activeTab}`}
              className="shrink-0 flex items-center gap-1 rounded-lg bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/25 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {c.leadCoach && <span className="text-xs text-muted-foreground">Coach: <span className="text-foreground">{c.leadCoach}</span></span>}
            <StatusSelect candidate={c} onChanged={onRefresh} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Shared helpers ─── */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
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
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={cn("text-xl sm:text-2xl font-bold", color)}>{value}</p>
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

function FilterSelect({
  value, onChange, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  const isActive = !!value;
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-lg border px-2.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-colors cursor-pointer",
        isActive
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o} className="bg-card text-foreground">{o}</option>
      ))}
    </select>
  );
}
