"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Search, CheckCircle2, ExternalLink } from "lucide-react";
import { Candidate } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CompletedPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data: Candidate[]) => {
        setCandidates(data.filter((c) => c.status === "completed"));
        setLoading(false);
      });
  }, []);

  const placed = candidates.filter((c) => c.jobStatus === "Y");

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.candidateName.toLowerCase().includes(q) || c.clientName.toLowerCase().includes(q) || c.newCompany?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Completed Programs"
        description={`${candidates.length} completed · ${placed.length} successfully placed`}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Completed</p>
          <p className="text-3xl font-bold text-foreground">{candidates.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Successfully Placed</p>
          <p className="text-3xl font-bold text-emerald-400">{placed.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Placement Rate</p>
          <p className="text-3xl font-bold text-primary">
            {candidates.length > 0 ? Math.round((placed.length / candidates.length) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates or companies…" className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sidebar/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Candidate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Coach</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">DiSC</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placed</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="group hover:bg-sidebar-accent/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                        {c.candidateName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{c.candidateName}</p>
                        <p className="text-xs text-muted-foreground">{c.partner}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{c.clientName}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.newCompany || "—"}</p>
                    {c.position && <p className="text-xs text-muted-foreground line-clamp-1">{c.position}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{c.leadCoach}</td>
                  <td className="px-4 py-3">
                    {c.discStyle
                      ? <span className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-medium text-primary">{c.discStyle}</span>
                      : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {c.jobStatus === "Y"
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      : <span className="text-xs text-muted-foreground">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/outplacement/candidates/${c.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No completed programs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
