"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, Printer, Plus, X, GripVertical, Loader2,
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVProfile, CVExperience, CVEducation, CVCertification, CVStyle,
} from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: "Modern",       value: "Inter, system-ui, sans-serif" },
  { label: "Classic",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Professional", value: "Arial, Helvetica, sans-serif" },
  { label: "Elegant",      value: "'Palatino Linotype', Palatino, serif" },
];

const ACCENT_PRESETS = [
  "#e11d48", // rose
  "#2563eb", // blue
  "#16a34a", // green
  "#7c3aed", // violet
  "#ea580c", // orange
  "#0891b2", // cyan
  "#1d4ed8", // indigo
  "#374151", // slate
];

const SECTION_DEFS = [
  { id: "summary",        label: "Professional Summary" },
  { id: "experience",     label: "Experience" },
  { id: "education",      label: "Education" },
  { id: "skills",         label: "Skills" },
  { id: "languages",      label: "Languages" },
  { id: "certifications", label: "Certifications" },
];

const DEFAULT_ORDER = SECTION_DEFS.map((s) => s.id);

const DEFAULT_STYLE: CVStyle = {
  accentColor: "#e11d48",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "md",
  spacing: "normal",
};

const EMPTY_CV: CVProfile = {
  headline: "", summary: "", linkedinAbout: "",
  skills: [], languages: [], certifications: [],
  experience: [], education: [],
  sectionOrder: DEFAULT_ORDER,
  style: DEFAULT_STYLE,
};

const FONT_SIZE_PX: Record<string, number> = { sm: 12.5, md: 13.5, lg: 15 };
const SPACING_GAP: Record<string, number>  = { compact: 10, normal: 18, relaxed: 28 };

// ─── Utils ────────────────────────────────────────────────────────────────────

function uid() { return `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

function newExp(): CVExperience {
  return { id: uid(), company: "", role: "", from: "", to: "", current: false, description: "", bullets: [""] };
}
function newEdu(): CVEducation {
  return { id: uid(), institution: "", degree: "", field: "", from: "", to: "" };
}
function newCert(): CVCertification {
  return { id: uid(), name: "", issuer: "", date: "" };
}

// ─── Bullet List Input ────────────────────────────────────────────────────────

function BulletListInput({
  bullets = [""],
  onChange,
}: {
  bullets?: string[];
  onChange: (bullets: string[]) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function update(i: number, val: string) {
    const next = [...bullets]; next[i] = val; onChange(next);
  }
  function addAfter(i: number) {
    const next = [...bullets]; next.splice(i + 1, 0, ""); onChange(next);
    setTimeout(() => inputRefs.current[i + 1]?.focus(), 20);
  }
  function remove(i: number) {
    if (bullets.length === 1) { onChange([""]); return; }
    const next = bullets.filter((_, idx) => idx !== i);
    onChange(next);
    setTimeout(() => inputRefs.current[Math.max(0, i - 1)]?.focus(), 20);
  }
  function handleKey(e: React.KeyboardEvent, i: number) {
    if (e.key === "Enter") { e.preventDefault(); addAfter(i); }
    if (e.key === "Backspace" && bullets[i] === "" && bullets.length > 1) {
      e.preventDefault(); remove(i);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium text-muted-foreground mb-1">Key Achievements & Responsibilities</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0">•</span>
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            value={b}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            placeholder="Achievement or responsibility… (Enter to add more)"
            className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button onClick={() => remove(i)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button onClick={() => addAfter(bullets.length - 1)}
        className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors mt-1">
        <Plus className="h-3 w-3" /> Add bullet
      </button>
    </div>
  );
}

// ─── Chip Input (skills / languages) ─────────────────────────────────────────

function ChipInput({
  chips,
  placeholder,
  onChange,
}: {
  chips: string[];
  placeholder: string;
  onChange: (chips: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const val = input.trim();
    if (!val || chips.includes(val)) return;
    onChange([...chips, val]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button onClick={add} disabled={!input.trim()}
          className="rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="flex items-center gap-1 rounded-full bg-sidebar-accent px-2.5 py-0.5 text-xs text-foreground">
              {c}
              <button onClick={() => onChange(chips.filter((x) => x !== c))} className="text-muted-foreground/50 hover:text-rose-400 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────

function CVPreview({ cv, name }: { cv: CVProfile; name: string }) {
  const style   = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };
  const accent  = style.accentColor;
  const ff      = style.fontFamily;
  const basePx  = FONT_SIZE_PX[style.fontSize ?? "md"];
  const gap     = SPACING_GAP[style.spacing ?? "normal"];
  const order   = cv.sectionOrder ?? DEFAULT_ORDER;

  const px  = (n: number) => `${n}px`;
  const em  = (n: number) => `${(n / basePx).toFixed(3)}em`;

  function SectionHeading({ title }: { title: string }) {
    return (
      <div style={{ marginBottom: px(gap * 0.5) }}>
        <p style={{
          fontSize: em(basePx * 0.72),
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: accent,
          marginBottom: "4px",
        }}>
          {title}
        </p>
        <div style={{ height: "1.5px", background: accent, opacity: 0.25 }} />
      </div>
    );
  }

  const renderSection = (id: string) => {
    switch (id) {
      case "summary":
        if (!cv.summary) return null;
        return (
          <div key="summary" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Professional Summary" />
            <p style={{ fontSize: em(basePx), lineHeight: 1.6, color: "#374151", whiteSpace: "pre-line" }}>
              {cv.summary}
            </p>
          </div>
        );

      case "experience":
        if (!cv.experience?.length) return null;
        return (
          <div key="experience" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.8) }}>
              {cv.experience.map((exp) => {
                const bullets = exp.bullets?.filter(Boolean) ?? [];
                const dateStr = exp.from
                  ? `${exp.from} – ${exp.current ? "Present" : exp.to || ""}`
                  : "";
                return (
                  <div key={exp.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{exp.role || "Role"}</p>
                        {exp.company && (
                          <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{exp.company}</p>
                        )}
                      </div>
                      {dateStr && (
                        <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap", marginTop: "2px" }}>
                          {dateStr}
                        </p>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul style={{ margin: "6px 0 0 0", padding: 0, listStyle: "none" }}>
                        {bullets.map((b, i) => (
                          <li key={i} style={{ display: "flex", gap: "8px", marginBottom: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.55 }}>
                            <span style={{ color: accent, marginTop: "1px", flexShrink: 0 }}>›</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!bullets.length && exp.description && (
                      <p style={{ marginTop: "4px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "education":
        if (!cv.education?.length) return null;
        return (
          <div key="education" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Education" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>
                      {edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""}
                    </p>
                    {edu.institution && (
                      <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{edu.institution}</p>
                    )}
                  </div>
                  {(edu.from || edu.to) && (
                    <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap", marginTop: "2px" }}>
                      {edu.from}{edu.to ? ` – ${edu.to}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (!cv.skills?.length) return null;
        return (
          <div key="skills" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Skills" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {cv.skills.map((s) => (
                <span key={s} style={{
                  padding: "3px 10px", borderRadius: "999px",
                  border: `1px solid ${accent}40`,
                  backgroundColor: `${accent}0d`,
                  fontSize: em(basePx * 0.88), color: "#374151",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        );

      case "languages":
        if (!cv.languages?.length) return null;
        return (
          <div key="languages" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Languages" />
            <p style={{ fontSize: em(basePx), color: "#374151" }}>
              {cv.languages.join(" · ")}
            </p>
          </div>
        );

      case "certifications":
        if (!cv.certifications?.length) return null;
        return (
          <div key="certifications" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Certifications" />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {cv.certifications.map((cert) => (
                <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{cert.name || "Certification"}</span>
                    {cert.issuer && <span style={{ fontSize: em(basePx * 0.9), color: "#6b7280" }}> — {cert.issuer}</span>}
                  </div>
                  {cert.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{cert.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div
      id="cv-preview-panel"
      style={{
        background: "#ffffff",
        fontFamily: ff,
        fontSize: px(basePx),
        color: "#111827",
        minHeight: "700px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
        borderRadius: "6px",
        overflow: "hidden",
      }}
    >
      {/* Header band */}
      <div style={{ borderBottom: `3px solid ${accent}`, padding: "28px 32px 22px" }}>
        <p style={{ fontSize: px(basePx * 1.85), fontWeight: 700, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
          {name || "Your Name"}
        </p>
        {cv.headline && (
          <p style={{ fontSize: px(basePx * 1.02), color: accent, fontWeight: 500, marginTop: "5px" }}>
            {cv.headline}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 32px" }}>
        {order.map((id) => renderSection(id))}
      </div>

      {/* LinkedIn About (separate, below main sections) */}
      {cv.linkedinAbout && (
        <div style={{ borderTop: "1px dashed #e5e7eb", margin: "0 32px", padding: "18px 0" }}>
          <p style={{ fontSize: px(basePx * 0.72), fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "8px" }}>
            LinkedIn About
          </p>
          <p style={{ fontSize: px(basePx * 0.92), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {cv.linkedinAbout}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Section Editor Row (left panel) ─────────────────────────────────────────

function SectionRow({
  sectionId,
  isOpen,
  isHidden,
  onToggle,
  onToggleVisibility,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggingOver,
  children,
}: {
  sectionId: string;
  isOpen: boolean;
  isHidden: boolean;
  onToggle: () => void;
  onToggleVisibility: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDraggingOver: boolean;
  children: React.ReactNode;
}) {
  const def = SECTION_DEFS.find((s) => s.id === sectionId);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border bg-card transition-colors overflow-hidden",
        isDraggingOver ? "border-primary/60 bg-primary/5" : "border-border"
      )}
    >
      {/* Row header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Title */}
        <button onClick={onToggle} className="flex-1 text-left text-sm font-semibold text-foreground">
          {def?.label ?? sectionId}
        </button>

        {/* Visibility toggle */}
        <button
          onClick={onToggleVisibility}
          title={isHidden ? "Show section" : "Hide section"}
          className={cn("rounded p-1 transition-colors", isHidden ? "text-muted-foreground/30 hover:text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>

        {/* Expand/collapse */}
        <button onClick={onToggle} className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-border px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CVBuilder({
  candidateId,
  candidateName,
  initialCv,
}: {
  candidateId: string;
  candidateName: string;
  initialCv: CVProfile | null;
}) {
  const [cv, setCv]       = useState<CVProfile>(initialCv ?? EMPTY_CV);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [openSection, setOpenSection] = useState<string | null>("experience");
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [dragItem, setDragItem] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  // Inject print CSS on mount, clean up on unmount
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "cv-print-style";
    el.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #cv-preview-panel, #cv-preview-panel * { visibility: visible !important; }
        #cv-preview-panel {
          position: fixed !important;
          inset: 0 !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        @page { margin: 12mm 14mm; size: A4; }
      }
    `;
    document.head.appendChild(el);
    return () => { document.getElementById("cv-print-style")?.remove(); };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const order = cv.sectionOrder ?? DEFAULT_ORDER;

  function setOrder(newOrder: string[]) {
    setCv((p) => ({ ...p, sectionOrder: newOrder }));
  }

  function setStyle(partial: Partial<CVStyle>) {
    setCv((p) => ({ ...p, style: { ...(DEFAULT_STYLE), ...(p.style ?? {}), ...partial } }));
  }

  function toggleHidden(id: string) {
    setHiddenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (dragItem && dragItem !== id) setDragOver(id);
  }

  function handleDrop(targetId: string) {
    if (!dragItem || dragItem === targetId) { setDragItem(null); setDragOver(null); return; }
    const fromIdx = order.indexOf(dragItem);
    const toIdx   = order.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const next = [...order];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragItem);
    setOrder(next);
    setDragItem(null);
    setDragOver(null);
  }

  // ── Save ──────────────────────────────────────────────────────────────────────

  async function save() {
    setSaving(true);
    await fetch(`/api/candidates/${candidateId}/cv`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cv),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Experience helpers ────────────────────────────────────────────────────────

  function updateExp(id: string, patch: Partial<CVExperience>) {
    setCv((p) => ({ ...p, experience: p.experience.map((e) => e.id === id ? { ...e, ...patch } : e) }));
  }
  function removeExp(id: string) {
    setCv((p) => ({ ...p, experience: p.experience.filter((e) => e.id !== id) }));
  }

  // ── Education helpers ─────────────────────────────────────────────────────────

  function updateEdu(id: string, patch: Partial<CVEducation>) {
    setCv((p) => ({ ...p, education: p.education.map((e) => e.id === id ? { ...e, ...patch } : e) }));
  }
  function removeEdu(id: string) {
    setCv((p) => ({ ...p, education: p.education.filter((e) => e.id !== id) }));
  }

  // ── Certification helpers ─────────────────────────────────────────────────────

  function updateCert(id: string, patch: Partial<CVCertification>) {
    setCv((p) => ({ ...p, certifications: (p.certifications ?? []).map((c) => c.id === id ? { ...c, ...patch } : c) }));
  }
  function removeCert(id: string) {
    setCv((p) => ({ ...p, certifications: (p.certifications ?? []).filter((c) => c.id !== id) }));
  }

  // ── LinkedIn auto-generate ────────────────────────────────────────────────────

  function generateLinkedIn() {
    const latestExp = cv.experience[0];
    const roleStr   = latestExp ? `Currently ${latestExp.role} at ${latestExp.company}. ` : "";
    const skillStr  = cv.skills.length > 0 ? `\n\nCore skills: ${cv.skills.slice(0, 6).join(", ")}.` : "";
    const generated = [cv.headline, "\n\n", cv.summary, "\n\n", roleStr, skillStr].join("").trim();
    setCv((p) => ({ ...p, linkedinAbout: generated.slice(0, 2000) }));
  }

  // ── Field style ───────────────────────────────────────────────────────────────

  const inputCls = "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40";
  const labelCls = "block text-[11px] font-medium text-muted-foreground mb-0.5";

  // ── Section content renderers ─────────────────────────────────────────────────

  function renderSectionEditor(id: string) {
    switch (id) {
      case "summary":
        return (
          <textarea
            value={cv.summary}
            onChange={(e) => setCv((p) => ({ ...p, summary: e.target.value }))}
            rows={4}
            placeholder="A concise paragraph describing your career, key strengths, and what you bring to the table…"
            className={cn(inputCls, "resize-none")}
          />
        );

      case "experience":
        return (
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={exp.id} className="rounded-lg border border-border/60 bg-background/50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground">Position {i + 1}</p>
                  <button onClick={() => removeExp(exp.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })}
                      placeholder="e.g. Product Manager" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })}
                      placeholder="e.g. Acme Corp" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>From</label>
                    <input value={exp.from} onChange={(e) => updateExp(exp.id, { from: e.target.value })}
                      placeholder="Jan 2020" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>To</label>
                    <div className="flex items-center gap-1.5">
                      <input value={exp.current ? "" : exp.to}
                        onChange={(e) => updateExp(exp.id, { to: e.target.value })}
                        placeholder={exp.current ? "Present" : "Dec 2023"}
                        disabled={exp.current} className={cn(inputCls, "flex-1")} />
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer shrink-0">
                        <input type="checkbox" checked={exp.current} onChange={(e) => updateExp(exp.id, { current: e.target.checked })} />
                        Now
                      </label>
                    </div>
                  </div>
                </div>
                <BulletListInput
                  bullets={exp.bullets ?? [""]}
                  onChange={(bullets) => updateExp(exp.id, { bullets })}
                />
              </div>
            ))}
            <button onClick={() => setCv((p) => ({ ...p, experience: [...p.experience, newExp()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Add Position
            </button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {cv.education.map((edu, i) => (
              <div key={edu.id} className="rounded-lg border border-border/60 bg-background/50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground">Entry {i + 1}</p>
                  <button onClick={() => removeEdu(edu.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Institution</label>
                    <input value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })}
                      placeholder="e.g. University of Manchester" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })}
                      placeholder="e.g. BSc, MBA" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Field of Study</label>
                    <input value={edu.field} onChange={(e) => updateEdu(edu.id, { field: e.target.value })}
                      placeholder="e.g. Computer Science" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className={labelCls}>From</label>
                      <input value={edu.from} onChange={(e) => updateEdu(edu.id, { from: e.target.value })}
                        placeholder="2018" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>To</label>
                      <input value={edu.to} onChange={(e) => updateEdu(edu.id, { to: e.target.value })}
                        placeholder="2021" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setCv((p) => ({ ...p, education: [...p.education, newEdu()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Add Education
            </button>
          </div>
        );

      case "skills":
        return (
          <ChipInput
            chips={cv.skills}
            placeholder="Type a skill and press Enter…"
            onChange={(chips) => setCv((p) => ({ ...p, skills: chips }))}
          />
        );

      case "languages":
        return (
          <ChipInput
            chips={cv.languages ?? []}
            placeholder="e.g. English (Fluent), Spanish (Intermediate)…"
            onChange={(chips) => setCv((p) => ({ ...p, languages: chips }))}
          />
        );

      case "certifications":
        return (
          <div className="space-y-3">
            {(cv.certifications ?? []).map((cert, i) => (
              <div key={cert.id} className="rounded-lg border border-border/60 bg-background/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-muted-foreground">Cert {i + 1}</p>
                  <button onClick={() => removeCert(cert.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={labelCls}>Certification Name</label>
                    <input value={cert.name} onChange={(e) => updateCert(cert.id, { name: e.target.value })}
                      placeholder="e.g. AWS Solutions Architect" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Issuer</label>
                    <input value={cert.issuer} onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date</label>
                    <input value={cert.date} onChange={(e) => updateCert(cert.id, { date: e.target.value })}
                      placeholder="e.g. June 2023" className={inputCls} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setCv((p) => ({ ...p, certifications: [...(p.certifications ?? []), newCert()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity">
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </button>
          </div>
        );

      default: return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const currentStyle = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        {/* Basics: headline */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Professional Headline</label>
            <input
              value={cv.headline}
              onChange={(e) => setCv((p) => ({ ...p, headline: e.target.value }))}
              placeholder="e.g. Senior Product Manager | SaaS | B2B"
              className={inputCls}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Style controls row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Accent color */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Colour</span>
            <div className="flex items-center gap-1.5">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => setStyle({ accentColor: c })}
                  title={c}
                  className={cn(
                    "h-5 w-5 rounded-full transition-transform",
                    currentStyle.accentColor === c ? "scale-125 ring-2 ring-offset-1 ring-offset-card ring-primary/60" : "hover:scale-110"
                  )}
                  style={{ background: c }}
                />
              ))}
              <label className="cursor-pointer" title="Custom colour">
                <input type="color" value={currentStyle.accentColor}
                  onChange={(e) => setStyle({ accentColor: e.target.value })}
                  className="sr-only" />
                <div className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors text-[9px] font-bold">
                  +
                </div>
              </label>
            </div>
          </div>

          {/* Font */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Font</span>
            <select
              value={currentStyle.fontFamily}
              onChange={(e) => setStyle({ fontFamily: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
            >
              {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>

          {/* Size */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Size</span>
            <div className="flex rounded-md border border-border overflow-hidden">
              {(["sm", "md", "lg"] as const).map((s) => (
                <button key={s} onClick={() => setStyle({ fontSize: s })}
                  className={cn(
                    "px-2.5 py-1 text-xs transition-colors",
                    currentStyle.fontSize === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                </button>
              ))}
            </div>
          </div>

          {/* Spacing */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">Spacing</span>
            <div className="flex rounded-md border border-border overflow-hidden">
              {(["compact", "normal", "relaxed"] as const).map((s) => (
                <button key={s} onClick={() => setStyle({ spacing: s })}
                  className={cn(
                    "px-2.5 py-1 text-xs capitalize transition-colors",
                    currentStyle.spacing === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {s === "compact" ? "Compact" : s === "normal" ? "Normal" : "Spacious"}
                </button>
              ))}
            </div>
          </div>

          {/* Actions — pushed right */}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saved ? "Saved!" : saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Split: Editor | Preview ──────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr,440px]">

        {/* LEFT — Section editors */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-muted-foreground px-1">
            Drag sections to reorder · click eye to hide from preview
          </p>
          {order.map((id) => (
            <SectionRow
              key={id}
              sectionId={id}
              isOpen={openSection === id}
              isHidden={hiddenSections.has(id)}
              onToggle={() => setOpenSection(openSection === id ? null : id)}
              onToggleVisibility={() => toggleHidden(id)}
              onDragStart={() => setDragItem(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => { setDragItem(null); setDragOver(null); }}
              isDraggingOver={dragOver === id}
            >
              {renderSectionEditor(id)}
            </SectionRow>
          ))}

          {/* LinkedIn About section (outside reorderable list) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenSection(openSection === "linkedin" ? null : "linkedin")}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">LinkedIn About</span>
              </div>
              {openSection === "linkedin"
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            {openSection === "linkedin" && (
              <div className="border-t border-border px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">2,000 character LinkedIn &ldquo;About&rdquo; section</p>
                  <button onClick={generateLinkedIn}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-colors">
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </button>
                </div>
                <textarea
                  value={cv.linkedinAbout}
                  onChange={(e) => setCv((p) => ({ ...p, linkedinAbout: e.target.value.slice(0, 2000) }))}
                  rows={7}
                  placeholder="Write a compelling LinkedIn About section…"
                  className={cn(inputCls, "resize-none")}
                />
                <p className="text-right text-[10px] text-muted-foreground">{cv.linkedinAbout.length}/2000</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">Live Preview</p>
            <button onClick={() => window.print()}
              className="flex items-center gap-1 text-[11px] text-primary hover:opacity-80 transition-opacity">
              <Download className="h-3 w-3" /> Save as PDF
            </button>
          </div>
          <CVPreview cv={cv} name={candidateName} />
        </div>
      </div>
    </div>
  );
}
