"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Search, ExternalLink, ArrowRight } from "lucide-react";
import { Candidate } from "@/lib/types";
import Link from "next/link";

export default function WipPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/candidates")
      .then((r) => r.json())
      .then((data: Candidate[]) => {
        setCandidates(data.filter((c) => c.status === "active"));
        setLoading(false);
      });
  }, []);

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.candidateName.toLowerCase().includes(q) || c.newPlacement?.toLowerCase().includes(q) || c.clientName.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="WIP — Job Search"
        description={`${candidates.length} candidates actively searching for new placements`}
      />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidates or companies…" className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/outplacement/candidates/${c.id}`}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-sidebar-accent/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-400">
                    {c.candidateName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.candidateName}</p>
                    <p className="text-xs text-muted-foreground">{c.clientName}</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {(c.oldPlacement || c.newPlacement) && (
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground truncate">{c.oldPlacement || "—"}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                  <span className="font-medium text-foreground truncate">{c.newPlacement || "Searching…"}</span>
                </div>
              )}

              {c.position && (
                <p className="text-xs text-muted-foreground line-clamp-2">{c.position}</p>
              )}

              {c.sector && (
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{c.sector}</span>
              )}

              <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span>{c.leadCoach}</span>
                <span>{(c.sessions ?? []).length || c.sessionsCompleted} sessions done</span>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No WIP candidates found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
