"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Plus, Search, ExternalLink, Pencil, Trash2, Globe, MapPin } from "lucide-react";
import { Company } from "@/lib/types";

function CompanyModal({ item, onClose, onSaved }: { item?: Company; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!item;
  const empty = { companyName: "", industry: "", website: "", pointOfContact: "", pocLinkedin: "", pocLocation: "", notes: "" };
  const [form, setForm] = useState(item ?? empty);
  const [saving, setSaving] = useState(false);

  function set(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  async function save() {
    setSaving(true);
    const url = isEdit ? `/api/companies/${item!.id}` : "/api/companies";
    await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold text-foreground">{isEdit ? "Edit Company" : "Add Company"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          {[
            ["Company Name", "companyName", false], ["Industry", "industry", false],
            ["Website", "website", false], ["Point of Contact", "pointOfContact", false],
            ["POC LinkedIn", "pocLinkedin", false], ["POC Location", "pocLocation", false],
            ["Notes", "notes", true],
          ].map(([label, field, wide]) => (
            <div key={String(field)} className={`space-y-1 ${wide ? "col-span-2" : ""}`}>
              <label className="text-xs font-medium text-muted-foreground">{String(label)}</label>
              <input value={form[field as keyof typeof form]} onChange={e => set(String(field), e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
          <button onClick={save} disabled={saving || !form.companyName} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving…" : isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Company | undefined>();
  const [loading, setLoading] = useState(true);

  async function load() { const r = await fetch("/api/companies"); setItems(await r.json()); setLoading(false); }
  useEffect(() => { load(); }, []);

  async function del(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = items.filter(c => {
    const q = search.toLowerCase();
    return !q || c.companyName.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.pocLocation.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Relevant Companies" description={`${items.length} target companies with HR contacts`}>
        <button onClick={() => { setEditing(undefined); setShowModal(true); }} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add Company
        </button>
      </PageHeader>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, industries…" className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(c => (
            <div key={c.id} className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{c.companyName}</h3>
                  <span className="inline-block mt-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">{c.industry}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(c); setShowModal(true); }} className="rounded p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => del(c.id, c.companyName)} className="rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              {c.pointOfContact && (
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Point of Contact</p>
                  <p className="text-sm text-foreground">{c.pointOfContact}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {c.pocLocation && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.pocLocation}</span>
                )}
              </div>

              {c.notes && <p className="text-xs text-muted-foreground border-t border-border pt-2">{c.notes}</p>}

              <div className="mt-auto flex gap-2 border-t border-border pt-3">
                {c.website && (
                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Globe className="h-3 w-3" /> Website
                  </a>
                )}
                {c.pocLinkedin && (
                  <a href={c.pocLinkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                    <ExternalLink className="h-3 w-3" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex h-48 items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No companies found</p>
            </div>
          )}
        </div>
      )}

      {showModal && <CompanyModal item={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
}
