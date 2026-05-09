"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, Pencil, Trash2, ArrowRight } from "lucide-react";
import { Transition } from "@/lib/types";
import { cn } from "@/lib/utils";

function TransitionModal({ item, onClose, onSaved }: { item?: Transition; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const empty = { year: new Date().getFullYear().toString(), candidateName: "", clientName: "", leadOwner: "", consultantInCharge: "", supports: "", oldJob: "", newPlacement: "", newJobTitle: "", email: "", phone: "" };
  const [form, setForm] = useState(item ?? empty);
  const [saving, setSaving] = useState(false);

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function save() {
    setSaving(true);
    const url = isEdit ? `/api/transitions/${item!.id}` : "/api/transitions";
    await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">{isEdit ? "Edit Transition" : "Add Transition"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          {[
            ["Year", "year"], ["Candidate Name", "candidateName"], ["Client / Company", "clientName"],
            ["Lead Owner", "leadOwner"], ["Consultant In-Charge", "consultantInCharge"], ["Supports", "supports"],
            ["Old Job / From", "oldJob"], ["New Placement / To", "newPlacement"], ["New Job Title", "newJobTitle"],
          ].map(([label, field]) => (
            <div key={field} className={cn("space-y-1", field === "newJobTitle" && "col-span-2")}>
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <input value={form[field as keyof typeof form]} onChange={e => set(field, e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={save} disabled={saving || !form.candidateName} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TransitionsPage() {
  const [items, setItems] = useState<Transition[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Transition | undefined>();
  const [loading, setLoading] = useState(true);

  async function load() { const r = await fetch("/api/transitions"); setItems(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function del(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/transitions/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return !q || i.candidateName.toLowerCase().includes(q) || i.clientName.toLowerCase().includes(q) || i.newPlacement.toLowerCase().includes(q);
  });

  const byYear = filtered.reduce<Record<string, Transition[]>>((acc, t) => {
    (acc[t.year] = acc[t.year] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Client Confirmed Transitions" description={`${items.length} total placements confirmed`}>
        <button onClick={() => { setEditing(undefined); setShowModal(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Transition
        </button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates, companies…" className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="space-y-6">
          {Object.keys(byYear).sort((a, b) => Number(b) - Number(a)).map(year => (
            <div key={year}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{year}</h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-sidebar/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Candidate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Transition</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
                      <th className="w-20 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {byYear[year].map(t => (
                      <tr key={t.id} className="group hover:bg-sidebar-accent/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                              {t.candidateName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{t.candidateName}</p>
                              <p className="text-xs text-muted-foreground">{t.clientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">{t.oldJob || "—"}</span>
                            <ArrowRight className="h-3 w-3 shrink-0 text-primary" />
                            <span className="font-medium text-foreground">{t.newPlacement}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{t.newJobTitle}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-foreground">{t.consultantInCharge}</p>
                          <p className="text-xs text-muted-foreground">{t.leadOwner}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditing(t); setShowModal(true); }} className="rounded p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                            <button onClick={() => del(t.id, t.candidateName)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No transitions found</p>
            </div>
          )}
        </div>
      )}

      {showModal && <TransitionModal item={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
