"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ShieldCheck, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Candidate, DiscDoneStatus, InvoiceStatus, CostingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const discColors: Record<DiscDoneStatus, string> = {
  Done: "bg-emerald-500/20 text-white border border-emerald-500",
  "Not Done": "bg-rose-500/20 text-white",
};

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

const DISC_OPTIONS: DiscDoneStatus[] = ["Done", "Not Done"];
const INVOICE_OPTIONS: InvoiceStatus[] = ["Not Raised", "Raised", "Cleared"];
const COSTING_OPTIONS: CostingStatus[] = ["Not Done", "To be reviewed", "Done"];

const statusColorMap: Record<string, string> = {
  referred: "bg-violet-500/20 text-violet-400",
  candidate_reached: "bg-sky-500/20 text-sky-400",
  active: "bg-emerald-500/20 text-emerald-400",
  completed: "bg-blue-500/20 text-blue-400",
  declined: "bg-rose-500/20 text-rose-400",
};

export default function CandidateManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") router.push("/outplacement");
  }, [session, status, router]);

  async function load() {
    const res = await fetch("/api/candidates");
    setCandidates(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateField(id: string, field: string, value: string) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
    await fetch(`/api/candidates/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
  }

  async function sendReminders() {
    setSending(true);
    setReminderResult(null);
    const res = await fetch("/api/reminders", { method: "POST" });
    const data = await res.json();
    setSending(false);
    setReminderResult(data.message || (res.ok ? "Reminders sent." : "Failed to send."));
  }

  const pendingCount = candidates.filter(
    (c) => c.discDone === "Not Done" || c.invoiceStatus === "Not Raised" || c.costingStatus === "Not Done"
  ).length;

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
        <SummaryPill label="DiSC Pending" value={candidates.filter((c) => c.discDone === "Not Done").length} color="text-rose-400" icon={Clock} />
        <SummaryPill label="Invoice Not Raised" value={candidates.filter((c) => c.invoiceStatus === "Not Raised").length} color="text-amber-400" icon={AlertCircle} />
        <SummaryPill label="Costing Pending" value={candidates.filter((c) => c.costingStatus === "Not Done").length} color="text-rose-400" icon={Clock} />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-sidebar/50 px-4 py-3">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">All Candidates — Admin View</span>
          <span className="ml-auto text-xs text-muted-foreground">{candidates.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sidebar/30">
                {["Candidate", "Partner", "Client", "Level", "Status", "Start Date", "End Date", "DiSC", "Invoice", "Costing", "Notes"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/outplacement/candidates/${c.id}?from=admin`)}
                  className="group cursor-pointer hover:bg-sidebar-accent/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground whitespace-nowrap group-hover:text-primary transition-colors">{c.candidateName}</p>
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect value={c.discDone} options={DISC_OPTIONS} colorMap={discColors} onChange={(v) => updateField(c.id, "discDone", v)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect value={c.invoiceStatus} options={INVOICE_OPTIONS} colorMap={invoiceColors} onChange={(v) => updateField(c.id, "invoiceStatus", v)} />
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <InlineSelect value={c.costingStatus} options={COSTING_OPTIONS} colorMap={costingColors} onChange={(v) => updateField(c.id, "costingStatus", v)} />
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="truncate text-xs text-muted-foreground" title={c.notes}>{c.notes || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ExternalLink className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
