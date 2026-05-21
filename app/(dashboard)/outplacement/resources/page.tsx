"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import { Plus, X, Copy, Check, ExternalLink, Trash2, Pencil, BookOpen, Mail, FileText, Link2, Search } from "lucide-react";
import { Resource, ResourceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: ResourceCategory[] = ["Email Templates", "Reading Materials", "Guides", "Other"];

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  "Email Templates": Mail,
  "Reading Materials": BookOpen,
  "Guides": FileText,
  "Other": Link2,
};

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  "Email Templates": "text-sky-400 bg-sky-500/10 border-sky-500/20",
  "Reading Materials": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Guides": "text-violet-400 bg-violet-500/10 border-violet-500/20",
  "Other": "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

const TYPE_OPTIONS = [
  { value: "template", label: "Template" },
  { value: "document", label: "Document / File URL" },
  { value: "link", label: "Link" },
];

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/* ─── Resource Modal ─── */
function ResourceModal({
  resource,
  onClose,
  onSaved,
}: {
  resource?: Resource;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!resource;
  const [form, setForm] = useState({
    title: resource?.title ?? "",
    description: resource?.description ?? "",
    category: resource?.category ?? ("Email Templates" as ResourceCategory),
    type: resource?.type ?? ("template" as Resource["type"]),
    content: resource?.content ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.content.trim()) { setError("Content / URL is required."); return; }
    setSaving(true);
    setError("");
    const url = isEdit ? `/api/resources/${resource!.id}` : "/api/resources";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      let msg = "Failed to save. Please try again.";
      try { const d = await res.json(); if (d?.error) msg = d.error; } catch {}
      setError(msg);
      return;
    }
    onSaved();
  }

  const contentLabel = form.type === "template" ? "Template Content" : form.type === "link" ? "URL" : "File URL";
  const contentPlaceholder = form.type === "template"
    ? "Dear [Candidate Name],\n\nI hope this message finds you well..."
    : "https://...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{isEdit ? "Edit Resource" : "Add Resource"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {error && <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm text-destructive">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Introduction Email Template" className={inputCls} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputCls}>
                {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description</label>
              <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of this resource..." className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{contentLabel} *</label>
              {form.type === "template" ? (
                <textarea
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder={contentPlaceholder}
                  rows={10}
                  className={inputCls + " resize-y font-mono text-xs leading-relaxed"}
                />
              ) : (
                <input value={form.content} onChange={(e) => set("content", e.target.value)} placeholder={contentPlaceholder} className={inputCls} />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Resource"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Resource Card ─── */
function ResourceCard({
  resource,
  isAdmin,
  onEdit,
  onDelete,
}: {
  resource: Resource;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[resource.category];

  async function handleCopy() {
    await navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border", CATEGORY_COLORS[resource.category])}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{resource.title}</p>
            {resource.description && <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {isAdmin && (
            <>
              <button onClick={onEdit} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors" title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", CATEGORY_COLORS[resource.category])}>
          {resource.category}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
          {resource.type}
        </span>
        <div className="flex-1" />
        {resource.type === "template" && (
          <button
            onClick={() => setExpanded((p) => !p)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "Hide" : "Preview"}
          </button>
        )}
        {resource.type === "template" && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-sidebar-accent transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
        {(resource.type === "link" || resource.type === "document") && (
          <a
            href={resource.content}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open
          </a>
        )}
      </div>

      {/* Template preview */}
      {expanded && resource.type === "template" && (
        <div className="rounded-lg border border-border bg-sidebar/50 p-3">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground font-mono leading-relaxed">{resource.content}</pre>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function ResourcesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editResource, setEditResource] = useState<Resource | undefined>();

  async function load() {
    const res = await fetch("/api/resources");
    const data = await res.json();
    setResources(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this resource?")) return;
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    load();
  }

  const filtered = resources.filter((r) => {
    if (activeCategory !== "All" && r.category !== activeCategory) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { All: resources.length };
  for (const cat of CATEGORIES) counts[cat] = resources.filter((r) => r.category === cat).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Resources"
        description="Email templates, reading materials, guides and more."
      >
        {isAdmin && (
          <button
            onClick={() => { setEditResource(undefined); setShowModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        )}
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resources…"
          className="w-full rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as (ResourceCategory | "All")[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === cat
                ? "border-primary bg-primary/20 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
            )}
          >
            {cat}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", activeCategory === cat ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground")}>
              {counts[cat] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No resources found</p>
          {isAdmin && <p className="text-xs text-muted-foreground/60 mt-1">Click "Add Resource" to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              isAdmin={isAdmin}
              onEdit={() => { setEditResource(r); setShowModal(true); }}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ResourceModal
          resource={editResource}
          onClose={() => { setShowModal(false); setEditResource(undefined); }}
          onSaved={() => { setShowModal(false); setEditResource(undefined); load(); }}
        />
      )}
    </div>
  );
}
