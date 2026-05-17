"use client";

import { useRef, useState } from "react";
import {
  Folder, FolderOpen, File, FileText, FileImage, FileVideo, FileArchive,
  Upload, Plus, X, Download, Trash2, FolderInput, ChevronRight, ArrowLeft,
  MoreHorizontal, FolderPlus,
} from "lucide-react";
import { Candidate, DocumentFolder, CandidateDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

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

export function DocumentManager({
  candidate,
  onUpdated,
}: {
  candidate: Candidate;
  onUpdated: (c: Candidate) => void;
}) {
  const folders = candidate.folders ?? [];
  const documents = candidate.documents ?? [];

  const [activeFolder, setActiveFolder] = useState<string | null>(null); // null = root
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [menuDocId, setMenuDocId] = useState<string | null>(null);
  const [moving, setMoving] = useState<string | null>(null); // docId being moved
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentFolder = folders.find((f) => f.id === activeFolder) ?? null;
  const visibleDocs = documents.filter((d) =>
    activeFolder === null ? d.folderId === null : d.folderId === activeFolder
  );

  // ── Folder creation ───────────────────────────────────────────────────────
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

  // ── Folder deletion ───────────────────────────────────────────────────────
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

  // ── File upload ───────────────────────────────────────────────────────────
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      if (activeFolder) form.append("folderId", activeFolder);
      await fetch(`/api/candidates/${candidate.id}/documents`, {
        method: "POST",
        body: form,
      });
    }
    // Refresh candidate
    const res = await fetch(`/api/candidates/${candidate.id}`);
    if (res.ok) onUpdated(await res.json());
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── File download ─────────────────────────────────────────────────────────
  async function handleDownload(doc: CandidateDocument) {
    const res = await fetch(`/api/candidates/${candidate.id}/documents/${doc.id}/download`);
    if (!res.ok) { alert("Could not generate download link."); return; }
    const { url, name } = await res.json();
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  // ── File deletion ─────────────────────────────────────────────────────────
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

  // ── Move document ─────────────────────────────────────────────────────────
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

  // ── Drag & drop ───────────────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentFolder && (
            <button onClick={() => setActiveFolder(null)}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
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

      {/* Move document picker overlay */}
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
          /* Empty state */
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
            {/* Folders (only visible at root) */}
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

            {/* Documents */}
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
                onMenuToggle={() => setMenuDocId(menuDocId === doc.id ? null : doc.id)}
                onDownload={() => handleDownload(doc)}
                onDelete={() => handleDeleteDoc(doc)}
                onMoveStart={() => { setMoving(doc.id); setMenuDocId(null); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag hint */}
      <p className="mt-3 text-center text-[11px] text-muted-foreground/50">
        Drag & drop files anywhere to upload
      </p>
    </div>
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
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-accent transition-colors cursor-pointer"
      onClick={onOpen}>
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
        className="shrink-0 text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-rose-400 transition-all ml-1"
        title="Delete folder"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Document Row ─── */
function DocumentRow({
  doc, folders, isMenuOpen, isMoving, onMenuToggle, onDownload, onDelete, onMoveStart,
}: {
  doc: CandidateDocument;
  folders: DocumentFolder[];
  isMenuOpen: boolean;
  isMoving: boolean;
  onMenuToggle: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onMoveStart: () => void;
}) {
  const Icon = getFileIcon(doc.mimeType);
  const iconColor = getFileColor(doc.mimeType);
  const inFolder = folders.find((f) => f.id === doc.folderId);

  return (
    <div className={cn(
      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
      isMoving ? "border border-primary/30 bg-primary/5" : "hover:bg-sidebar-accent"
    )}>
      <Icon className={cn("h-5 w-5 shrink-0", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(doc.size)} · {formatDate(doc.uploadedAt)} · {doc.uploadedBy}
          {inFolder && <span className="ml-1 text-amber-400/70">· {inFolder.name}</span>}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onDownload}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary hover:bg-primary/10 transition-all">
          <Download className="h-3.5 w-3.5" />
        </button>

        <div className="relative">
          <button onClick={onMenuToggle}
            className={cn(
              "rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all",
              isMenuOpen ? "opacity-100 bg-sidebar-accent" : "opacity-0 group-hover:opacity-100"
            )}>
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-border bg-card shadow-xl">
              <button onClick={onDownload}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors rounded-t-lg">
                <Download className="h-3.5 w-3.5 text-muted-foreground" /> Download
              </button>
              <button onClick={onMoveStart}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-sidebar-accent transition-colors">
                <FolderInput className="h-3.5 w-3.5 text-muted-foreground" /> Move to…
              </button>
              <button onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors rounded-b-lg">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
