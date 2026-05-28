"use client";

import { useRef, useState } from "react";
import {
  Folder, FolderOpen, File, FileText, FileImage, FileVideo, FileArchive,
  Upload, X, Download, Trash2, FolderInput, ChevronRight, ArrowLeft,
  MoreHorizontal, FolderPlus, Eye, Loader2,
} from "lucide-react";
import { Candidate, DocumentFolder, CandidateDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.startsWith("video/")) return FileVideo;
  if (mimeType.includes("pdf")) return FileText;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return FileArchive;
  if (mimeType.includes("word") || mimeType.includes("document")) return FileText;
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return FileText;
  return File;
}

function getFileColor(mimeType: string) {
  if (mimeType.startsWith("image/")) return "text-violet-400";
  if (mimeType.startsWith("video/")) return "text-rose-400";
  if (mimeType.includes("pdf")) return "text-red-400";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "text-amber-400";
  if (mimeType.includes("word") || mimeType.includes("document")) return "text-sky-400";
  if (mimeType.includes("sheet") || mimeType.includes("excel")) return "text-emerald-400";
  return "text-muted-foreground";
}

type PreviewType = "image" | "pdf" | "office" | "none";

function getPreviewType(mimeType: string, name: string): PreviewType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.includes("pdf")) return "pdf";
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "office";
  if (mimeType.includes("word") || mimeType.includes("document") ||
      mimeType.includes("sheet") || mimeType.includes("excel") ||
      mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "office";
  return "none";
}

/* ─── Preview Modal ─── */

function PreviewModal({
  doc,
  url,
  onClose,
  onDownload,
}: {
  doc: CandidateDocument;
  url: string;
  onClose: () => void;
  onDownload: () => void;
}) {
  const Icon = getFileIcon(doc.mimeType);
  const iconColor = getFileColor(doc.mimeType);
  const previewType = getPreviewType(doc.mimeType, doc.name);
  const [iframeLoading, setIframeLoading] = useState(true);

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-black/60 px-5 py-3">
        <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
        <p className="flex-1 truncate text-sm font-medium text-white">{doc.name}</p>
        <span className="shrink-0 text-xs text-white/50">{formatBytes(doc.size)}</span>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button
          onClick={onClose}
          className="ml-1 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Preview area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {previewType === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={doc.name}
            className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}

        {previewType === "pdf" && (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
              </div>
            )}
            <iframe
              src={url}
              className="h-full w-full rounded-lg"
              onLoad={() => setIframeLoading(false)}
              title={doc.name}
            />
          </>
        )}

        {previewType === "office" && (
          <>
            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/40" />
              </div>
            )}
            <iframe
              src={googleViewerUrl}
              className="h-full w-full rounded-lg bg-white"
              onLoad={() => setIframeLoading(false)}
              title={doc.name}
            />
          </>
        )}

        {previewType === "none" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
              <Icon className={cn("h-10 w-10", iconColor)} />
            </div>
            <div>
              <p className="text-base font-medium text-white">{doc.name}</p>
              <p className="mt-1 text-sm text-white/50">Preview not available for this file type</p>
            </div>
            <button
              onClick={onDownload}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Download className="h-4 w-4" /> Download file
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function DocumentManager({
  candidate,
  onUpdated,
}: {
  candidate: Candidate;
  onUpdated: (c: Candidate) => void;
}) {
  const folders = candidate.folders ?? [];
  const documents = candidate.documents ?? [];

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [menuDocId, setMenuDocId] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<CandidateDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = folders.find((f) => f.id === activeFolder) ?? null;
  const visibleDocs = documents.filter((d) =>
    activeFolder === null ? d.folderId === null : d.folderId === activeFolder
  );

  /* ── Folder creation ── */
  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    const res = await fetch(`/api/candidates/${candidate.id}/folders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const { candidate: updated } = await res.json();
      onUpdated(updated);
    }
    setNewFolderName("");
    setShowNewFolder(false);
  }

  /* ── Folder deletion ── */
  async function handleDeleteFolder(folderId: string, folderName: string) {
    const docsInFolder = documents.filter((d) => d.folderId === folderId).length;
    const msg = docsInFolder > 0
      ? `Delete folder "${folderName}"? The ${docsInFolder} document${docsInFolder > 1 ? "s" : ""} inside will be moved to root.`
      : `Delete folder "${folderName}"?`;
    if (!confirm(msg)) return;
    if (activeFolder === folderId) setActiveFolder(null);
    const res = await fetch(`/api/candidates/${candidate.id}/folders`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId }),
    });
    if (res.ok) onUpdated(await res.json());
  }

  /* ── File upload ── */
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      if (activeFolder) form.append("folderId", activeFolder);
      const res = await fetch(`/api/candidates/${candidate.id}/documents`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        let msg = `Failed to upload "${file.name}"`;
        try {
          const data = await res.json();
          if (data?.error) msg = data.error;
        } catch { /* ignore parse errors */ }
        errors.push(msg);
      }
    }
    if (errors.length > 0) {
      setUploadError(errors.join(" · "));
    }
    const refreshed = await fetch(`/api/candidates/${candidate.id}`);
    if (refreshed.ok) onUpdated(await refreshed.json());
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ── Build file URL ── */
  function docUrl(doc: CandidateDocument, forDownload = false) {
    const base = `/api/candidates/${candidate.id}/documents/${doc.id}/download`;
    return forDownload ? `${base}?attachment=1` : base;
  }

  /* ── Preview ── */
  function handlePreview(doc: CandidateDocument) {
    setMenuDocId(null);
    setPreviewDoc(doc);
    setPreviewUrl(docUrl(doc));
  }

  /* ── Download ── */
  function handleDownload(doc: CandidateDocument) {
    setMenuDocId(null);
    const a = document.createElement("a");
    a.href = docUrl(doc, true);
    a.download = doc.name;
    a.click();
  }

  /* ── Delete ── */
  async function handleDeleteDoc(doc: CandidateDocument) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/candidates/${candidate.id}/documents`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id }),
    });
    if (res.ok) onUpdated(await res.json());
    setMenuDocId(null);
  }

  /* ── Move ── */
  async function handleMove(docId: string, targetFolderId: string | null) {
    const res = await fetch(`/api/candidates/${candidate.id}/documents/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: docId, folderId: targetFolderId }),
    });
    if (res.ok) onUpdated(await res.json());
    setMoving(null);
    setMenuDocId(null);
  }

  /* ── Drag & drop ── */
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentFolder && (
              <button onClick={() => setActiveFolder(null)}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-semibold text-foreground">
              {currentFolder ? (
                <span className="flex items-center gap-1.5">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                  {currentFolder.name}
                </span>
              ) : "Documents"}
            </h2>
            {!currentFolder && (
              <span className="text-xs text-muted-foreground">
                {documents.length} file{documents.length !== 1 ? "s" : ""}
                {folders.length > 0 && ` · ${folders.length} folder${folders.length !== 1 ? "s" : ""}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!currentFolder && (
              <button onClick={() => setShowNewFolder((v) => !v)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <FolderPlus className="h-3.5 w-3.5" /> New Folder
              </button>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden"
              onChange={(e) => handleUpload(e.target.files)} />
          </div>
        </div>

        {/* Upload error banner */}
        {uploadError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <p className="flex-1 text-xs text-rose-400">{uploadError}</p>
            <button onClick={() => setUploadError(null)} className="shrink-0 text-rose-400/60 hover:text-rose-400 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* New folder input */}
        {showNewFolder && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-amber-400/40 bg-amber-400/5 px-4 py-2.5">
            <Folder className="h-4 w-4 shrink-0 text-amber-400" />
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
              }}
              placeholder="Folder name…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button onClick={handleCreateFolder} disabled={!newFolderName.trim()}
              className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 disabled:opacity-40 transition-colors">
              Create
            </button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Move picker */}
        {moving && (
          <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <p className="mb-2 text-xs font-semibold text-primary">Move to…</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleMove(moving, null)}
                className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-sidebar-accent transition-colors">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" /> Root
              </button>
              {folders.map((f) => (
                <button key={f.id} onClick={() => handleMove(moving, f.id)}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-sidebar-accent transition-colors">
                  <Folder className="h-3.5 w-3.5 text-amber-400" /> {f.name}
                </button>
              ))}
            </div>
            <button onClick={() => setMoving(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        )}

        {/* Drop zone + content */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "min-h-[120px] rounded-lg transition-colors",
            "border-2 border-dashed border-transparent",
            uploading && "border-primary/30 bg-primary/5"
          )}
        >
          {folders.length === 0 && documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Folder className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No documents yet</p>
              <p className="text-xs text-muted-foreground/60">Upload files or create folders to organise documents</p>
              <button onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload files
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Folders */}
              {!currentFolder && folders.map((folder) => {
                const count = documents.filter((d) => d.folderId === folder.id).length;
                return (
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    docCount={count}
                    onOpen={() => setActiveFolder(folder.id)}
                    onDelete={() => handleDeleteFolder(folder.id, folder.name)}
                  />
                );
              })}

              {/* Files */}
              {visibleDocs.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {currentFolder ? "No files in this folder yet." : "No files at root level."}
                </p>
              )}
              {visibleDocs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  folders={folders}
                  isMenuOpen={menuDocId === doc.id}
                  isMoving={moving === doc.id}
                  onPreview={() => handlePreview(doc)}
                  onMenuToggle={() => setMenuDocId(menuDocId === doc.id ? null : doc.id)}
                  onDownload={() => handleDownload(doc)}
                  onDelete={() => handleDeleteDoc(doc)}
                  onMoveStart={() => { setMoving(doc.id); setMenuDocId(null); }}
                />
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground/50">
          Drag & drop files anywhere to upload · Click a file to preview
        </p>
      </div>

      {/* Preview modal */}
      {previewDoc && previewUrl && (
        <PreviewModal
          doc={previewDoc}
          url={previewUrl}
          onClose={() => { setPreviewDoc(null); setPreviewUrl(null); }}
          onDownload={() => handleDownload(previewDoc)}
        />
      )}
    </>
  );
}

/* ─── Folder Row ─── */
function FolderRow({
  folder, docCount, onOpen, onDelete,
}: {
  folder: DocumentFolder;
  docCount: number;
  onOpen: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent transition-colors"
      onClick={onOpen}
    >
      <Folder className="h-5 w-5 shrink-0 text-amber-400" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {docCount} file{docCount !== 1 ? "s" : ""} · {formatDate(folder.createdAt)}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="ml-1 shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Document Row ─── */
function DocumentRow({
  doc, folders, isMenuOpen, isMoving,
  onPreview, onMenuToggle, onDownload, onDelete, onMoveStart,
}: {
  doc: CandidateDocument;
  folders: DocumentFolder[];
  isMenuOpen: boolean;
  isMoving: boolean;
  onPreview: () => void;
  onMenuToggle: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onMoveStart: () => void;
}) {
  const Icon = getFileIcon(doc.mimeType);
  const iconColor = getFileColor(doc.mimeType);
  const inFolder = folders.find((f) => f.id === doc.folderId);
  const canPreview = getPreviewType(doc.mimeType, doc.name) !== "none";

  return (
    <div className={cn(
      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
      isMoving ? "border border-primary/30 bg-primary/5" : "hover:bg-sidebar-accent"
    )}>
      {/* Clicking the icon or name triggers preview */}
      <button
        onClick={canPreview ? onPreview : onDownload}
        className="flex flex-1 items-center gap-3 text-left min-w-0"
      >
        <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className={cn(
              "text-sm font-medium truncate transition-colors",
              canPreview ? "text-foreground group-hover:text-primary" : "text-foreground"
            )}>
              {doc.name}
            </p>
            {doc.source === "candidate" && (
              <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400 border border-emerald-500/25">
                Candidate
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatBytes(doc.size)} · {formatDate(doc.uploadedAt)} · {doc.uploadedBy}
            {inFolder && <span className="ml-1 text-amber-400/70">· {inFolder.name}</span>}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        {/* Preview button (hover) */}
        {canPreview && (
          <button
            onClick={onPreview}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
            title="Preview"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Download button (hover) */}
        <button
          onClick={onDownload}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
        </button>

        {/* ⋯ Menu */}
        <div className="relative">
          <button
            onClick={onMenuToggle}
            className={cn(
              "rounded-md px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all",
              isMenuOpen ? "opacity-100 bg-sidebar-accent" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card shadow-xl">
              {canPreview && (
                <button onClick={onPreview}
                  className="flex w-full items-center gap-2 rounded-t-lg px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" /> Preview
                </button>
              )}
              <button onClick={onDownload}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors",
                  !canPreview && "rounded-t-lg"
                )}>
                <Download className="h-3.5 w-3.5 text-muted-foreground" /> Download
              </button>
              <button onClick={onMoveStart}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors">
                <FolderInput className="h-3.5 w-3.5 text-muted-foreground" /> Move to…
              </button>
              <button onClick={onDelete}
                className="flex w-full items-center gap-2 rounded-b-lg px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
