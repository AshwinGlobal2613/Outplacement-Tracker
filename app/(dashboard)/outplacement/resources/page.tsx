"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/page-header";
import {
  Plus, X, Copy, Check, ExternalLink, Trash2, Pencil,
  BookOpen, Mail, FileText, Link2, Search, Eye,
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Table2,
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
const isTableRow = (l: string) => /^\|.+\|$/.test(l.trim());
const isSepRow   = (l: string) => /^\|[\s\-:|]+\|$/.test(l.trim());
const parseRow   = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());

function renderMarkdown(raw: string): string {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  const out: string[] = [];
  let inUL = false, inOL = false, inCL = false, inTable = false;

  function closeLists() {
    if (inUL) { out.push("</ul>");  inUL = false; }
    if (inOL) { out.push("</ol>");  inOL = false; }
    if (inCL) { out.push("</ul>");  inCL = false; }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ── Table continuation ──────────────────────────────────────────────
    if (inTable) {
      if (isTableRow(line) && !isSepRow(line)) {
        out.push(`<tr>${parseRow(line).map(c => `<td>${applyInline(c)}</td>`).join("")}</tr>`);
        continue;
      }
      out.push("</tbody></table>");
      inTable = false;
    }

    // ── Table start: header row + separator on next line ────────────────
    if (isTableRow(line) && i + 1 < lines.length && isSepRow(lines[i + 1])) {
      closeLists();
      const headers = parseRow(line);
      out.push(`<table><thead><tr>${headers.map(h => `<th>${applyInline(h)}</th>`).join("")}</tr></thead><tbody>`);
      inTable = true;
      i++; // skip separator row
      continue;
    }

    // ── Checklist ────────────────────────────────────────────────────────
    const cl = line.match(/^- \[(x| )\] (.+)/i);
    if (cl) {
      if (!inCL) { closeLists(); out.push('<ul class="checklist">'); inCL = true; }
      out.push(`<li><input type="checkbox" disabled ${cl[1].toLowerCase() === "x" ? "checked" : ""} /> ${applyInline(cl[2])}</li>`);
      continue;
    }

    // ── Nested bullet ────────────────────────────────────────────────────
    const ind = line.match(/^(?:  |\t)- (.+)/);
    if (ind) { out.push(`<ul class="nested"><li>${applyInline(ind[1])}</li></ul>`); continue; }

    // ── Bullet ───────────────────────────────────────────────────────────
    const ul = line.match(/^- (.+)/);
    if (ul) {
      if (inCL) { out.push("</ul>"); inCL = false; }
      if (!inUL) { if (inOL) { out.push("</ol>"); inOL = false; } out.push("<ul>"); inUL = true; }
      out.push(`<li>${applyInline(ul[1])}</li>`);
      continue;
    }

    // ── Numbered ─────────────────────────────────────────────────────────
    const ol = line.match(/^\d+\. (.+)/);
    if (ol) {
      if (inCL) { out.push("</ul>"); inCL = false; }
      if (!inOL) { if (inUL) { out.push("</ul>"); inUL = false; } out.push("<ol>"); inOL = true; }
      out.push(`<li>${applyInline(ol[1])}</li>`);
      continue;
    }

    // ── Paragraph / blank ────────────────────────────────────────────────
    closeLists();
    out.push(line.trim() === "" ? "<br />" : `<p>${applyInline(line)}</p>`);
  }

  if (inUL) out.push("</ul>");
  if (inOL) out.push("</ol>");
  if (inCL) out.push("</ul>");
  if (inTable) out.push("</tbody></table>");
  return out.join("");
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    .replace(/~~(.*?)~~/g, "<s>$1</s>")
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, (_, label, url) =>
      url
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:opacity-80">${label}</a>`
        : `<span class="text-primary underline opacity-60">${label}</span>`
    );
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
      <ToolBtn icon={LinkIcon}      label="Hyperlink"              fmt="link"      onFormat={onFormat} />
      <Sep />
      {/* Lists */}
      <ToolBtn icon={List}          label="Bullet list"            fmt="bullet"    onFormat={onFormat} />
      <ToolBtn icon={ListOrdered}   label="Numbered list"          fmt="numbered"  onFormat={onFormat} />
      <ToolBtn icon={ListChecks}    label="Checklist"              fmt="checklist" onFormat={onFormat} />
      <Sep />
      {/* Indent */}
      <ToolBtn icon={Outdent}       label="Decrease indent"        fmt="outdent"   onFormat={onFormat} />
      <ToolBtn icon={Indent}        label="Increase indent"        fmt="indent"    onFormat={onFormat} />
      <Sep />
      {/* Table */}
      <ToolBtn icon={Table2}        label="Insert table"           fmt="table"     onFormat={onFormat} />
    </div>
  );
}

/* ─── HTML → Markdown (for WYSIWYG sync) ─── */
function htmlToMarkdown(root: HTMLElement): string {
  function walk(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE)
      return (node.textContent ?? "").replace(/ /g, " ");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el   = node as HTMLElement;
    const tag  = el.tagName.toLowerCase();
    const kids = () => Array.from(el.childNodes).map(walk).join("");

    switch (tag) {
      case "b": case "strong": { const t = kids(); return t ? `**${t}**` : ""; }
      case "i": case "em":     { const t = kids(); return t ? `*${t}*`   : ""; }
      case "u":                { const t = kids(); return t ? `__${t}__` : ""; }
      case "s": case "del": case "strike": { const t = kids(); return t ? `~~${t}~~` : ""; }
      case "a": return `[${kids()}](${el.getAttribute("href") ?? ""})`;
      case "br": return "\n";
      case "p": case "div": { const t = kids(); return t ? t + "\n" : "\n"; }
      case "ul": {
        return Array.from(el.querySelectorAll(":scope > li")).map(li => {
          const cb = (li as HTMLElement).querySelector("input[type='checkbox']") as HTMLInputElement | null;
          if (cb) {
            const txt = Array.from(li.childNodes).filter(n => n !== cb).map(walk).join("").trim();
            return `- [${cb.checked ? "x" : " "}] ${txt}`;
          }
          return `- ${Array.from(li.childNodes).map(walk).join("").trim()}`;
        }).join("\n") + "\n";
      }
      case "ol": {
        return Array.from(el.querySelectorAll(":scope > li")).map((li, i) =>
          `${i + 1}. ${Array.from(li.childNodes).map(walk).join("").trim()}`
        ).join("\n") + "\n";
      }
      case "li": return kids();
      case "table": {
        const rows = Array.from(el.querySelectorAll("tr"));
        if (!rows.length) return "";
        const lines: string[] = [];
        rows.forEach((row, i) => {
          const cells = Array.from(row.querySelectorAll("th, td"))
            .map(c => (c.textContent ?? "").trim().replace(/\|/g, "\\|"));
          lines.push(`| ${cells.join(" | ")} |`);
          if (i === 0) lines.push(`| ${cells.map(() => "---").join(" | ")} |`);
        });
        return "\n" + lines.join("\n") + "\n\n";
      }
      case "thead": case "tbody": case "tfoot":
      case "tr": case "th": case "td":
      case "span": case "font":
        return kids();
      default: return kids();
    }
  }
  return Array.from(root.childNodes).map(walk).join("")
    .replace(/\n{3,}/g, "\n\n").trim();
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
  const editorRef  = useRef<HTMLDivElement>(null);
  const initMd     = useRef(resource?.content ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title:       resource?.title       ?? "",
    description: resource?.description ?? "",
    category:    resource?.category    ?? ("Email Templates" as ResourceCategory),
    type:        resource?.type        ?? ("template" as Resource["type"]),
    content:     resource?.content     ?? "",
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  // Callback ref: initialise the editor when the div mounts
  const editorCallbackRef = useCallback((el: HTMLDivElement | null) => {
    (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (!el) return;
    el.innerHTML = renderMarkdown(initMd.current) || "<p><br></p>";
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function syncContent() {
    if (editorRef.current)
      set("content", htmlToMarkdown(editorRef.current));
  }

  function applyFormat(fmt: string) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    switch (fmt) {
      case "bold":      document.execCommand("bold",          false); break;
      case "italic":    document.execCommand("italic",        false); break;
      case "underline": document.execCommand("underline",     false); break;
      case "strike":    document.execCommand("strikeThrough", false); break;
      case "bullet":    document.execCommand("insertUnorderedList", false); break;
      case "numbered":  document.execCommand("insertOrderedList",   false); break;
      case "indent":    document.execCommand("indent",  false); break;
      case "outdent":   document.execCommand("outdent", false); break;
      case "link": {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) return;
        const url = window.prompt("Enter URL:", "https://");
        if (!url) { editor.focus(); return; }
        document.execCommand("createLink", false, url);
        editor.querySelectorAll("a").forEach(a => {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
          (a as HTMLElement).style.color = "var(--primary)";
        });
        break;
      }
      case "checklist": {
        document.execCommand("insertUnorderedList", false);
        const sel = window.getSelection();
        if (sel?.anchorNode) {
          let n: Node | null = sel.anchorNode;
          while (n && (n as Element).tagName?.toLowerCase() !== "li") n = n.parentNode;
          if (n && !(n as HTMLElement).querySelector("input")) {
            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.style.cssText = "margin-right:6px;accent-color:var(--primary);";
            (n as HTMLElement).insertBefore(cb, (n as HTMLElement).firstChild);
          }
        }
        break;
      }
      case "table": {
        const table = document.createElement("table");
        const thead = table.createTHead();
        const hRow  = thead.insertRow();
        ["Column 1", "Column 2", "Column 3"].forEach(txt => {
          const th = document.createElement("th");
          th.textContent = txt;
          hRow.appendChild(th);
        });
        const tbody = table.createTBody();
        for (let r = 0; r < 2; r++) {
          const row = tbody.insertRow();
          for (let c = 0; c < 3; c++) { const td = row.insertCell(); td.innerHTML = "<br>"; }
        }
        const sel = window.getSelection();
        if (sel?.rangeCount) {
          const range = sel.getRangeAt(0);
          range.collapse(false);
          const spacer = document.createElement("p");
          spacer.innerHTML = "<br>";
          range.insertNode(table);
          range.insertNode(spacer);
          const firstCell = tbody.rows[0]?.cells[0];
          if (firstCell) {
            const r2 = document.createRange();
            r2.setStart(firstCell, 0);
            r2.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r2);
          }
        }
        break;
      }
    }
    setTimeout(syncContent, 20);
  }

  function handleEditorKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const sel = window.getSelection();
      if (sel?.rangeCount) {
        // Navigate table cells with Tab / Shift+Tab
        let node: Node | null = sel.anchorNode;
        let cell: HTMLElement | null = null;
        while (node && node !== editorRef.current) {
          const tag = (node as Element).tagName?.toLowerCase();
          if (tag === "td" || tag === "th") { cell = node as HTMLElement; break; }
          node = node.parentNode;
        }
        if (cell) {
          const all = Array.from(cell.closest("table")!.querySelectorAll("th,td")) as HTMLElement[];
          const target = e.shiftKey ? all[all.indexOf(cell) - 1] : all[all.indexOf(cell) + 1];
          if (target) {
            const r = document.createRange();
            r.selectNodeContents(target);
            r.collapse(false);
            sel.removeAllRanges();
            sel.addRange(r);
          }
          return;
        }
      }
      document.execCommand("insertText", false, "  ");
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (k === "b") { e.preventDefault(); applyFormat("bold"); }
      if (k === "i") { e.preventDefault(); applyFormat("italic"); }
      if (k === "u") { e.preventDefault(); applyFormat("underline"); }
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/resources/upload", { method: "POST", body: fd });
    setUploadingFile(false);
    if (res.ok) {
      const { url, fileName } = await res.json();
      set("content", url);
      setUploadedFileName(fileName);
    } else {
      const d = await res.json();
      setError(d.error || "Upload failed.");
    }
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

  const contentLabel = form.type === "template" ? "Template Content" : form.type === "link" ? "URL *" : "Upload File or Paste URL *";

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
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{contentLabel} *</label>

              {form.type === "template" ? (
                <div>
                  <FormatToolbar onFormat={applyFormat} />
                  {/* WYSIWYG contenteditable — shows rendered HTML, no raw markdown */}
                  <div
                    ref={editorCallbackRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={syncContent}
                    onKeyDown={handleEditorKeyDown}
                    className="min-h-[280px] w-full rounded-b-lg rounded-t-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary overflow-y-auto leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:min-w-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
                    data-placeholder="Start typing your template…"
                  />
                </div>
              ) : form.type === "document" ? (
                <div className="space-y-2">
                  {/* File upload area */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-background px-4 py-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    {uploadingFile ? (
                      <p className="text-sm text-muted-foreground">Uploading…</p>
                    ) : uploadedFileName ? (
                      <div>
                        <p className="text-sm font-medium text-emerald-400">✓ {uploadedFileName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Click to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-foreground">Click to upload a file</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PDF, Word, Excel, PowerPoint, images, ZIP…</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {/* Or paste URL manually */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 border-t border-border" />
                    <span>or paste a URL</span>
                    <div className="flex-1 border-t border-border" />
                  </div>
                  <input
                    value={form.content}
                    onChange={(e) => { set("content", e.target.value); if (e.target.value) setUploadedFileName(""); }}
                    placeholder="https://..."
                    className={inputCls}
                  />
                </div>
              ) : (
                <input
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="https://..."
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
              className="text-sm text-foreground leading-relaxed [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_s]:line-through [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-1 [&_p]:mb-2 [&_.nested]:pl-6 [&_.checklist]:list-none [&_.checklist_li]:flex [&_.checklist_li]:items-center [&_.checklist_li]:gap-2 [&_input[type=checkbox]]:accent-primary [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2"
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
