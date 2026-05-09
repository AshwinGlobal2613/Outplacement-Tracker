"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ExternalLink, Pencil, Trash2, MapPin } from "lucide-react";
import { Headhunter } from "@/lib/types";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  Recruiter: "bg-emerald-500/20 text-emerald-400",
  Headhunter: "bg-violet-500/20 text-violet-400",
  Specialist: "bg-amber-500/20 text-amber-400",
};

function HeadhunterModal({ item, onClose, onSaved }: { item?: Headhunter; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const empty = { name: "", type: "Recruiter" as Headhunter["type"], specialization: "", linkedin: "", email: "", location: "", notes: "" };
  const [form, setForm] = useState(item ?? empty);
  const [saving, setSaving] = useState(false);

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function save() {
    setSaving(true);
    const url = isEdit ? `/api/headhunters/${item!.id}` : "/api/headhunters";
    await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">{isEdit ? "Edit Contact" : "Add Headhunter / Recruiter"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              <option>Recruiter</option><option>Headhunter</option><option>Specialist</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Specialization</label>
            <input value={form.specialization} onChange={e => set("specialization", e.target.value)} placeholder="Oil & Gas, Energy…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">LinkedIn</label>
            <input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Location</label>
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="UAE, Qatar…" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <input value={form.notes} onChange={e => set("notes", e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={save} disabled={saving || !form.name} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeadhuntersPage() {
  const [items, setItems] = useState<Headhunter[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | Headhunter["type"]>("All");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Headhunter | undefined>();
  const [loading, setLoading] = useState(true);

  async function load() { const r = await fetch("/api/headhunters"); setItems(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function del(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/headhunters/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = items.filter(h => {
    const q = search.toLowerCase();
    const matchType = typeFilter === "All" || h.type === typeFilter;
    const matchSearch = !q || h.name.toLowerCase().includes(q) || h.specialization.toLowerCase().includes(q) || h.location.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Headhunters & Recruiters" description={`${items.length} contacts in your network`}>
        <button onClick={() => { setEditing(undefined); setShowModal(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, specialization, location…" className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {(["All", "Recruiter", "Headhunter", "Specialist"] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition-colors", typeFilter === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-sidebar/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialization</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Links</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(h => (
                <tr key={h.id} className="group hover:bg-sidebar-accent/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                        {h.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{h.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", typeColors[h.type])}>
                      {h.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{h.specialization}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{h.location || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{h.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {h.linkedin && (
                        <a href={h.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 text-xs">
                          <ExternalLink className="h-3 w-3" /> LinkedIn
                        </a>
                      )}
                      {h.email && (
                        <a href={`mailto:${h.email}`} className="text-primary hover:underline text-xs">{h.email}</a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(h); setShowModal(true); }} className="rounded p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => del(h.id, h.name)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No contacts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <HeadhunterModal item={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
