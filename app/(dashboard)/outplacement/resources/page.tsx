"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, X, Copy, Check, ExternalLink, Trash2, Pencil,
  BookOpen, Mail, FileText, Link2, Search, Eye,
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, ListChecks,
  Indent, Outdent,
} from "lucide-react";
import { Resource, ResourceCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: ResourceCategory[] = ["Email Templates", "Reading Materials", "Guides", "Other"];

const CATEGORY_ICONS: Record<ResourceCategory, React.ElementType> = {
  "Email Templates": Mail,
  "Reading Materials": BookOpen,
  "Guides": FileText,
  "Other": Link2,
};

const CATEGORY_COLORS: Record<ResourceCategory, { badge: string; icon: string; bar: string }> = {
  "Email Templates":   { badge: "text-sky-400 bg-sky-500/10 border-sky-500/20",     icon: "text-sky-400",     bar: "bg-sky-500" },
  "Reading Materials": { badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400", bar: "bg-emerald-500" },
  "Guides":            { badge: "text-violet-400 bg-violet-500/10 border-violet-500/20",  icon: "text-violet-400",  bar: "bg-violet-500" },
  "Other":             { badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",    icon: "text-amber-400",   bar: "bg-amber-500" },
};

const TYPE_OPTIONS = [
  { value: "template", label: "Template" },
  { value: "document", label: "Document / File URL" },
  { value: "link",     label: "Link" },
];

const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

/* ─── Markdown Renderer ─── */
function renderMarkdown(raw: string): string {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const output: string[] = [];
  let inUL = false;
  let inOL = false;
  let inCL = false;

  for (const line of lines) {
    const ul  = line.match(/^- (.+)/);
    const ol  = line.match(/^\d+\. (.+)/);
    const cl  = line.match(/^- \[(x| )\] (.+)/i);
    // indent: 2-space or tab prefix turns into nested item
    const ind = line.match(/^(?:  |\t)- (.+)/);

    if (cl) {
      if (!inCL) {
        if (inUL) { output.push("</ul>"); inUL = false; }
        if (inOL) { output.push("</ol>"); inOL = false; }
        output.push('<ul class="checklist">'); inCL = true;
      }
      const checked = cl[1].toLowerCase() === "x";
      output.push(`<li><input type="checkbox" disabled ${checked ? "checked" : ""} /> ${applyInline(cl[2])}</li>`);
    } else if (ind) {
      // nested bullet inside existing list
      output.push(`<ul class="nested"><li>${applyInline(ind[1])}</li></ul>`);
    } else if (ul) {
      if (inCL) { output.push("</ul>"); inCL = false; }
      if (!inUL) { if (inOL) { output.push("</ol>"); inOL = false; } output.push("<ul>"); inUL = true; }
      output.push(`<li>${applyInline(ul[1])}</li>`);
    } else if (ol) {
      if (inCL) { output.push("</ul>"); inCL = false; }
      if (!inOL) { if (inUL) { output.push("</ul>"); inUL = false; } output.push("<ol>"); inOL = true; }
      output.push(`<li>${applyInline(ol[1])}</li>`);
    } else {
      if (inUL) { output.push("</ul>"); inUL = false; }
      if (inOL) { output.push("</ol>"); inOL = false; }
      if (inCL) { output.push("</ul>"); inCL = false; }
      if (line.trim() === "") {
        output.push("<br />");
      } else {
        output.push(`<p>${applyInline(line)}</p>`);
      }
    }
  }
  if (inUL) output.push("</ul>");
  if (inOL) output.push("</ol>");
  if (inCL) output.push("</ul>");
  return output.join("");
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/~~(.*?)~~/g, "<s>$1</s>");
}

/* ─── Formatting Toolbar ─── */
function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-border shrink-0" />;
}

function ToolBtn({
  icon: Icon,
  label,
  fmt,
  onFormat,
}: {
  icon: React.ElementType;
  label: string;
  fmt: string;
  onFormat: (f: string) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onMouseDown={(e) => { e.preventDefault(); onFormat(fmt); }}
      className="rounded p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function FormatToolbar({ onFormat }: { onFormat: (fmt: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-border bg-sidebar px-2 py-1.5">
      {/* Text style */}
      <ToolBtn icon={Bold}          label="Bold (Ctrl+B)"          fmt="bold"      onFormat={onFormat} />
      <ToolBtn icon={Italic}        label="Italic (Ctrl+I)"        fmt="italic"    onFormat={onFormat} />
      <ToolBtn icon={Underline}     label="Underline (Ctrl+U)"     fmt="underline" onFormat={onFormat} />
      <ToolBtn icon={Strikethrough} label="Strikethrough"          fmt="strike"    onFormat={onFormat} />
      <Sep />
      {/* Lists */}
      <ToolBtn icon={List}          label="Bullet list"            fmt="bullet"    onFormat={onFormat} />
      <ToolBtn icon={ListOrdered}   label="Numbered list"          fmt="numbered"  onFormat={onFormat} />
      <ToolBtn icon={ListChecks}    label="Checklist"              fmt="checklist" onFormat={onFormat} />
      <Sep />
      {/* Indent */}
      <ToolBtn icon={Outdent}       label="Decrease indent"        fmt="outdent"   onFormat={onFormat} />
      <ToolBtn icon={Indent}        label="Increase indent"        fmt="indent"    onFormat={onFormat} />
    </div>
  );
}

/* ─── Resource Modal (Add / Edit) ─── */
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({
    title:       resource?.title       ?? "",
    description: resource?.description ?? "",
    category:    resource?.category    ?? ("Email Templates" as ResourceCategory),
    type:        resource?.type        ?? ("template" as Resource["type"]),
    content:     resource?.content     ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [preview, setPreview] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applyFormat(fmt: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = ta.value.substring(start, end);
    const before = ta.value.substring(0, start);
    const after  = ta.value.substring(end);

    // For line-level formats, find the current line's start
    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = ta.value.substring(lineStart, end === start ? ta.value.indexOf("\n", lineStart) >>> 0 || ta.value.length : end);

    let insert = "";
    let cursorOffset = 0;

    if (fmt === "bold") {
      insert = `**${sel || "bold text"}**`;
      cursorOffset = sel ? insert.length : 2;
    } else if (fmt === "italic") {
      insert = `*${sel || "italic text"}*`;
      cursorOffset = sel ? insert.length : 1;
    } else if (fmt === "underline") {
      insert = `__${sel || "underline text"}__`;
      cursorOffset = sel ? insert.length : 2;
    } else if (fmt === "strike") {
      insert = `~~${sel || "strikethrough"}~~`;
      cursorOffset = sel ? insert.length : 2;
    } else if (fmt === "bullet") {
      const prefix = before.endsWith("\n") || before === "" ? "" : "\n";
      insert = `${prefix}- ${sel || "List item"}`;
      cursorOffset = insert.length;
    } else if (fmt === "numbered") {
      const prefix = before.endsWith("\n") || before === "" ? "" : "\n";
      insert = `${prefix}1. ${sel || "List item"}`;
      cursorOffset = insert.length;
    } else if (fmt === "checklist") {
      const prefix = before.endsWith("\n") || before === "" ? "" : "\n";
      insert = `${prefix}- [ ] ${sel || "Task item"}`;
      cursorOffset = insert.length;
    } else if (fmt === "indent") {
      // Add 2 spaces at the start of the current line
      const newVal = ta.value.substring(0, lineStart) + "  " + ta.value.substring(lineStart);
      set("content", newVal);
      setTimeout(() => { ta.focus(); ta.setSelectionRange(start + 2, end + 2); }, 0);
      return;
    } else if (fmt === "outdent") {
      // Remove up to 2 leading spaces from current line
      const lineContent = ta.value.substring(lineStart);
      const stripped = lineContent.replace(/^( {1,2}|\t)/, "");
      const removed = lineContent.length - stripped.length;
      if (removed > 0) {
        const newVal = ta.value.substring(0, lineStart) + stripped;
        set("content", newVal);
        setTimeout(() => { ta.focus(); ta.setSelectionRange(Math.max(lineStart, start - removed), Math.max(lineStart, end - removed)); }, 0);
      }
      return;
    }

    const next = before + insert + after;
    set("content", next);
    setTimeout(() => {
      ta.focus();
      const pos = start + cursorOffset;
      ta.setSelectionRange(pos, pos);
    }, 0);
  }

  async function handleSave() {
    if (!form.title.trim())   { setError("Title is required.");            return; }
    if (!form.content.trim()) { setError("Content / URL is required.");    return; }
    setSaving(true);
    setError("");
    const url    = isEdit ? `/api/resources/${resource!.id}` : "/api/resources";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      let msg = "Failed to save. Please try again.";
      try {
        const d = await res.json();
        if (d?.error) msg = typeof d.error === "string" ? d.error : JSON.stringify(d.error);
      } catch {}
      setError(msg);
      return;
    }
    onSaved();
  }

  const contentLabel       = form.type === "template" ? "Template Content" : form.type === "link" ? "URL" : "File URL";
  const contentPlaceholder = form.type === "template"
    ? "Dear [Candidate Name],\n\nI hope this message finds you well..."
    : "https://...";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Edit Resource" : "Add Resource"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Introduction Email Template"
                className={inputCls}
              />
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
              <input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of this resource..."
                className={inputCls}
              />
            </div>

            <div className="col-span-2">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">{contentLabel} *</label>
                {form.type === "template" && (
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Eye className="h-3 w-3" />
                    {preview ? "Edit" : "Preview"}
                  </button>
                )}
              </div>

              {form.type === "template" ? (
                preview ? (
                  <div
                    className="min-h-[200px] rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_.nested]:pl-6 [&_.checklist]:list-none [&_.checklist_li]:flex [&_.checklist_li]:items-center [&_.checklist_li]:gap-2"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(form.content) }}
                  />
                ) : (
                  <div>
                    <FormatToolbar onFormat={applyFormat} />
                    <textarea
                      ref={textareaRef}
                      value={form.content}
                      onChange={(e) => set("content", e.target.value)}
                      placeholder={contentPlaceholder}
                      rows={12}
                      className="w-full rounded-b-lg rounded-t-none border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono leading-relaxed"
                    />
                  </div>
                )
              ) : (
                <input
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder={contentPlaceholder}
                  className={inputCls}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Resource"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Preview Modal ─── */
function PreviewModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const colors = CATEGORY_COLORS[resource.category];
  const Icon   = CATEGORY_ICONS[resource.category];

  async function handleCopy() {
    await navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border mt-0.5", colors.badge)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-foreground leading-snug">{resource.title}</h2>
              {resource.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{resource.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", colors.badge)}>
                  {resource.category}
                </span>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
                  {resource.type}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {resource.type === "template" ? (
            <div
              className="text-sm text-foreground leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_.nested]:pl-6 [&_.checklist]:list-none [&_.checklist_li]:flex [&_.checklist_li]:items-center [&_.checklist_li]:gap-2 [&_input[type=checkbox]]:accent-primary"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(resource.content) }}
            />
          ) : (
            <a
              href={resource.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline text-sm break-all"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              {resource.content}
            </a>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          {resource.type === "template" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Template"}
            </button>
          )}
          {(resource.type === "link" || resource.type === "document") && (
            <a
              href={resource.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open Link
            </a>
          )}
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
  onPreview,
}: {
  resource: Resource;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const colors = CATEGORY_COLORS[resource.category];
  const Icon   = CATEGORY_ICONS[resource.category];

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      onClick={onPreview}
      className="group relative flex cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/20"
    >
      {/* Left accent bar */}
      <div className={cn("w-1 shrink-0", colors.bar)} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Top row: icon + title + admin actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colors.badge)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 pt-0.5">
              <p className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{resource.title}</p>
              {resource.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{resource.description}</p>
              )}
            </div>
          </div>
          {isAdmin && (
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom row: badges + actions */}
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", colors.badge)}>
            {resource.category}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground capitalize">
            {resource.type}
          </span>
          <div className="flex-1" />

          {resource.type === "template" && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
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
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(); }}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function ResourcesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [resources,       setResources]       = useState<Resource[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [activeCategory,  setActiveCategory]  = useState<ResourceCategory | "All">("All");
  const [search,          setSearch]          = useState("");
  const [showModal,       setShowModal]       = useState(false);
  const [editResource,    setEditResource]    = useState<Resource | undefined>();
  const [previewResource, setPreviewResource] = useState<Resource | undefined>();

  async function load() {
    const res  = await fetch("/api/resources");
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
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) &&
        !r.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts: Record<string, number> = { All: resources.length };
  for (const cat of CATEGORIES) counts[cat] = resources.filter((r) => r.category === cat).length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title="Resources" description="Email templates, reading materials, guides and more.">
        {isAdmin && (
          <button
            onClick={() => { setEditResource(undefined); setShowModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Resource
          </button>
        )}
      </PageHeader>

      {/* Search + filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="w-64 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

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
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                activeCategory === cat ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {counts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              isAdmin={isAdmin}
              onEdit={() => { setEditResource(r); setShowModal(true); }}
              onDelete={() => handleDelete(r.id)}
              onPreview={() => setPreviewResource(r)}
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

      {previewResource && (
        <PreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(undefined)}
        />
      )}
    </div>
  );
}
