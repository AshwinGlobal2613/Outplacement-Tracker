"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, Printer, Plus, X, GripVertical, Loader2,
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Download,
  Mail, Phone, MapPin, Globe, Briefcase, GraduationCap,
  Zap, Award, AlignLeft, Camera, Palette,
  Heart, FolderOpen, BookOpen, Trophy, Building2,
  FileText, UserCheck, PenLine, Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVProfile, CVExperience, CVEducation, CVCertification, CVStyle, CVContact,
  CVProject, CVCourse, CVAward, CVOrganisation, CVPublication, CVReference,
  CVCustomSection,
} from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: "Modern",       value: "Inter, system-ui, sans-serif" },
  { label: "Classic",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Professional", value: "Arial, Helvetica, sans-serif" },
  { label: "Elegant",      value: "'Palatino Linotype', Palatino, serif" },
];

const ACCENT_PRESETS = [
  "#e11d48", "#2563eb", "#16a34a", "#7c3aed",
  "#ea580c", "#0891b2", "#1d4ed8", "#374151",
];

const ALL_SECTIONS: {
  id: string; label: string; icon: React.ElementType; description: string; dashed?: boolean;
}[] = [
  { id: "summary",        label: "Professional Summary",  icon: AlignLeft,     description: "Add a brief overview of your professional background and key strengths." },
  { id: "experience",     label: "Professional Experience",icon: Briefcase,     description: "Add your professional roles and employer history including internships." },
  { id: "education",      label: "Education",             icon: GraduationCap, description: "Add your degrees and schools. Include your focus, honours, or exchange terms." },
  { id: "skills",         label: "Skills",                icon: Zap,           description: "Add your hard and soft skills that help you stand out from the crowd." },
  { id: "languages",      label: "Languages",             icon: Globe,         description: "Add your languages and proficiency level to show your communication range." },
  { id: "certifications", label: "Certificates",          icon: Award,         description: "Add your industry certificates or licences. Include issuer and date earned." },
  { id: "interests",      label: "Interests",             icon: Heart,         description: "Add relevant personal interests that support your career story and cultural fit." },
  { id: "projects",       label: "Projects",              icon: FolderOpen,    description: "Add key projects you participated in and highlight your challenges, role, and impact." },
  { id: "courses",        label: "Courses",               icon: BookOpen,      description: "Add online or in-person courses and trainings you joined and completed." },
  { id: "awards",         label: "Awards",                icon: Trophy,        description: "Add your awards and recognitions from industry, competitions, or academia." },
  { id: "organisations",  label: "Organisations",         icon: Building2,     description: "Add your memberships or volunteering with organisations including your role." },
  { id: "publications",   label: "Publications",          icon: FileText,      description: "Add publications, articles, or books you wrote or contributed to." },
  { id: "references",     label: "References",            icon: UserCheck,     description: "Add your references from managers or coworkers, including their contact details." },
  { id: "declaration",    label: "Declaration",           icon: PenLine,       description: "Add your declaration by creating or uploading your personal signature." },
  { id: "linkedin",       label: "LinkedIn About",        icon: Sparkles,      description: "Craft a compelling LinkedIn About section to complement your CV." },
  { id: "custom",         label: "Custom",                icon: Puzzle,        description: "Add a custom section for anything else, or combine sections cleanly.", dashed: true },
];

const DEFAULT_STYLE: CVStyle = {
  accentColor: "#e11d48",
  fontFamily:  "Inter, system-ui, sans-serif",
  fontSize:    "md",
  spacing:     "normal",
};

const EMPTY_CV: CVProfile = {
  headline: "", summary: "", linkedinAbout: "",
  skills: [], languages: [], certifications: [],
  experience: [], education: [],
  interests: [], projects: [], courses: [], awards: [],
  organisations: [], publications: [], references: [],
  declaration: "", customSections: [],
  sectionOrder: [],
  style:   DEFAULT_STYLE,
  contact: {},
};

const FONT_SIZE_PX: Record<string, number> = { sm: 12.5, md: 13.5, lg: 15 };
const SPACING_GAP: Record<string, number>  = { compact: 10, normal: 18, relaxed: 28 };

// ─── Utils ────────────────────────────────────────────────────────────────────

function uid() { return `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

const newExp    = (): CVExperience    => ({ id: uid(), company: "", role: "", from: "", to: "", current: false, description: "", bullets: [""] });
const newEdu    = (): CVEducation     => ({ id: uid(), institution: "", degree: "", field: "", from: "", to: "" });
const newCert   = (): CVCertification => ({ id: uid(), name: "", issuer: "", date: "" });
const newProj   = (): CVProject       => ({ id: uid(), title: "", description: "", link: "", from: "", to: "" });
const newCourse = (): CVCourse        => ({ id: uid(), name: "", provider: "", date: "", link: "" });
const newAward  = (): CVAward         => ({ id: uid(), title: "", issuer: "", date: "", description: "" });
const newOrg    = (): CVOrganisation  => ({ id: uid(), name: "", role: "", from: "", to: "", description: "" });
const newPub    = (): CVPublication   => ({ id: uid(), title: "", publisher: "", date: "", link: "", description: "" });
const newRef    = (): CVReference     => ({ id: uid(), name: "", jobTitle: "", company: "", email: "", phone: "" });
const newCustom = (): CVCustomSection => ({ id: uid(), title: "Custom Section", content: "" });

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 " +
  "focus:border-primary/40 transition-colors";
const labelCls = "block text-[11px] font-medium text-muted-foreground mb-1";

// ─── Bullet List Input ────────────────────────────────────────────────────────

function BulletListInput({ bullets = [""], onChange }: { bullets?: string[]; onChange: (b: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  function update(i: number, v: string) { const n = [...bullets]; n[i] = v; onChange(n); }
  function add(i: number) { const n = [...bullets]; n.splice(i + 1, 0, ""); onChange(n); setTimeout(() => refs.current[i + 1]?.focus(), 20); }
  function del(i: number) {
    if (bullets.length === 1) { onChange([""]); return; }
    onChange(bullets.filter((_, j) => j !== i));
    setTimeout(() => refs.current[Math.max(0, i - 1)]?.focus(), 20);
  }
  return (
    <div className="space-y-1.5">
      <p className={labelCls}>Key Achievements &amp; Responsibilities</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground/50 shrink-0">•</span>
          <input ref={(el) => { refs.current[i] = el; }} value={b}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(i); } if (e.key === "Backspace" && b === "" && bullets.length > 1) { e.preventDefault(); del(i); } }}
            placeholder="Achievement or responsibility… (Enter for new line)"
            className={cn(inputCls, "text-xs py-1.5")} />
          <button onClick={() => del(i)} className="text-muted-foreground/30 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button onClick={() => add(bullets.length - 1)} className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
        <Plus className="h-3 w-3" /> Add bullet
      </button>
    </div>
  );
}

// ─── Chip Input ───────────────────────────────────────────────────────────────

function ChipInput({ chips, placeholder, onChange }: { chips: string[]; placeholder: string; onChange: (c: string[]) => void }) {
  const [input, setInput] = useState("");
  function add() { const v = input.trim(); if (!v || chips.includes(v)) return; onChange([...chips, v]); setInput(""); }
  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder} className={cn(inputCls, "text-xs py-1.5")} />
        <button onClick={add} disabled={!input.trim()}
          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors">
          Add
        </button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs text-foreground">
              {c}
              <button onClick={() => onChange(chips.filter((x) => x !== c))} className="text-muted-foreground/40 hover:text-rose-400 transition-colors"><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Personal Info Card ───────────────────────────────────────────────────────

function PersonalInfoCard({ name, headline, contact, accentColor, onHeadlineChange, onContactChange }: {
  name: string; headline: string; contact: CVContact; accentColor: string;
  onHeadlineChange: (v: string) => void; onContactChange: (c: CVContact) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />
      <div className="p-5">
        <div className="flex gap-4 items-start">
          <div className="shrink-0">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center gap-0.5">
              <Camera className="h-5 w-5 text-muted-foreground/30" />
              <span className="text-[9px] text-muted-foreground/30">Photo</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground leading-tight">{name || "Your Name"}</p>
            <input value={headline} onChange={(e) => onHeadlineChange(e.target.value)}
              placeholder="Professional headline, e.g. Senior Product Manager" className={cn(inputCls, "mt-2 text-sm")} />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {([
            { icon: Mail,   key: "email",    ph: "Email address" },
            { icon: Phone,  key: "phone",    ph: "Phone number" },
            { icon: MapPin, key: "location", ph: "City, Country" },
            { icon: Globe,  key: "website",  ph: "LinkedIn or website URL" },
          ] as { icon: React.ElementType; key: string; ph: string }[]).map(({ icon: Icon, key, ph }) => (
            <div key={key} className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 transition-colors">
              <Icon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <input value={(contact as Record<string, string>)[key] ?? ""}
                onChange={(e) => onContactChange({ ...contact, [key]: e.target.value })}
                placeholder={ph} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Appearance Panel ─────────────────────────────────────────────────────────

function AppearancePanel({ currentStyle, onStyleChange }: { currentStyle: CVStyle; onStyleChange: (p: Partial<CVStyle>) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: `${currentStyle.accentColor}22` }}>
          <Palette className="h-4 w-4" style={{ color: currentStyle.accentColor }} />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">Appearance</span>
        <span className="hidden sm:block rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] text-muted-foreground">{currentStyle.fontFamily.split(",")[0]}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-4">
          <div>
            <p className={labelCls}>Accent Colour</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {ACCENT_PRESETS.map((c) => (
                <button key={c} onClick={() => onStyleChange({ accentColor: c })}
                  className={cn("h-6 w-6 rounded-full transition-all", currentStyle.accentColor === c ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-white/30" : "hover:scale-110 opacity-80 hover:opacity-100")}
                  style={{ background: c }} />
              ))}
              <label className="cursor-pointer">
                <input type="color" value={currentStyle.accentColor} onChange={(e) => onStyleChange({ accentColor: e.target.value })} className="sr-only" />
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold">+</div>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className={labelCls}>Font</p>
              <select value={currentStyle.fontFamily} onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30">
                {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <p className={labelCls}>Size</p>
              <div className="flex rounded-lg border border-border/60 overflow-hidden">
                {(["sm","md","lg"] as const).map((s) => (
                  <button key={s} onClick={() => onStyleChange({ fontSize: s })}
                    className={cn("flex-1 py-1.5 text-xs font-medium transition-colors", currentStyle.fontSize === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/40")}>
                    {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className={labelCls}>Spacing</p>
              <div className="flex rounded-lg border border-border/60 overflow-hidden">
                {(["compact","normal","relaxed"] as const).map((s, i) => (
                  <button key={s} onClick={() => onStyleChange({ spacing: s })} title={s}
                    className={cn("flex-1 py-1.5 text-xs font-medium transition-colors", currentStyle.spacing === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/40")}>
                    {["C","N","R"][i]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Editor Row ───────────────────────────────────────────────────────

function SectionRow({ sectionId, isOpen, isHidden, onToggle, onToggleVisibility, onRemove, onDragStart, onDragOver, onDrop, onDragEnd, isDraggingOver, children }: {
  sectionId: string; isOpen: boolean; isHidden: boolean;
  onToggle: () => void; onToggleVisibility: () => void; onRemove: () => void;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void; onDragEnd: () => void; isDraggingOver: boolean;
  children: React.ReactNode;
}) {
  const def  = ALL_SECTIONS.find((s) => s.id === sectionId);
  const Icon = def?.icon ?? AlignLeft;
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      className={cn("rounded-2xl border bg-card overflow-hidden shadow-sm transition-all",
        isDraggingOver ? "border-primary/50 bg-primary/5 shadow-md -translate-y-0.5" : "border-border/60 hover:border-border",
        isHidden && "opacity-60")}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <button onClick={onToggle} className="flex-1 text-left text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors">
          {def?.label ?? sectionId}
        </button>
        <button onClick={onToggleVisibility} title={isHidden ? "Show in CV" : "Hide from CV"}
          className={cn("rounded-lg p-1.5 transition-colors", isHidden ? "text-muted-foreground/30 hover:text-muted-foreground" : "text-muted-foreground/60 hover:text-foreground")}>
          {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing rounded-lg p-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">
          <GripVertical className="h-4 w-4" />
        </div>
        <button onClick={onToggle} className="rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors">
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onRemove} title="Remove section" className="rounded-lg p-1.5 text-muted-foreground/30 hover:text-rose-400 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {isOpen && <div className="border-t border-border/40 px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

// ─── Add Content Modal ────────────────────────────────────────────────────────

function AddContentModal({ addedSections, onAdd, onClose }: {
  addedSections: string[]; onAdd: (id: string) => void; onClose: () => void;
}) {
  const available = ALL_SECTIONS.filter((s) => !addedSections.includes(s.id));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-8 pt-8 pb-5">
          <h2 className="text-3xl font-bold text-gray-900">Add content</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-8 pb-8">
          {available.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {available.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => { onAdd(s.id); onClose(); }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl p-4 text-left hover:bg-gray-100 hover:shadow-sm transition-all",
                      s.dashed
                        ? "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400"
                        : "border border-gray-200 bg-gray-50 hover:border-gray-300"
                    )}>
                    <Icon className="h-5 w-5 text-gray-600" />
                    <p className="font-bold text-gray-900 text-sm leading-tight">{s.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">All available sections have been added to your CV.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AddContentButton({ addedSections, onAdd }: { addedSections: string[]; onAdd: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
        <Plus className="h-4 w-4" /> Add Content
      </button>
      {open && <AddContentModal addedSections={addedSections} onAdd={onAdd} onClose={() => setOpen(false)} />}
    </>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────

function CVPreview({ cv, name, addedSections, hiddenFromPreview }: {
  cv: CVProfile; name: string; addedSections: string[]; hiddenFromPreview: Set<string>;
}) {
  const style  = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };
  const accent = style.accentColor;
  const ff     = style.fontFamily;
  const basePx = FONT_SIZE_PX[style.fontSize ?? "md"];
  const gap    = SPACING_GAP[style.spacing ?? "normal"];
  const visibleSections = addedSections.filter((id) => id !== "linkedin" && !hiddenFromPreview.has(id));
  const contact = cv.contact ?? {};

  const px = (n: number) => `${n}px`;
  const em = (n: number) => `${(n / basePx).toFixed(3)}em`;

  function SectionHeading({ title }: { title: string }) {
    return (
      <div style={{ marginBottom: px(gap * 0.5) }}>
        <p style={{ fontSize: em(basePx * 0.72), fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "4px" }}>{title}</p>
        <div style={{ height: "1.5px", background: accent, opacity: 0.25 }} />
      </div>
    );
  }

  const chip = (label: string) => (
    <span key={label} style={{ padding: "3px 10px", borderRadius: "999px", border: `1px solid ${accent}40`, backgroundColor: `${accent}0d`, fontSize: em(basePx * 0.88), color: "#374151" }}>{label}</span>
  );

  const renderSection = (id: string) => {
    switch (id) {
      case "summary":
        if (!cv.summary) return null;
        return (
          <div key="summary" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Professional Summary" />
            <p style={{ fontSize: em(basePx), lineHeight: 1.6, color: "#374151", whiteSpace: "pre-line" }}>{cv.summary}</p>
          </div>
        );

      case "experience":
        if (!cv.experience?.length) return null;
        return (
          <div key="experience" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Professional Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.8) }}>
              {cv.experience.map((exp) => {
                const bullets = exp.bullets?.filter(Boolean) ?? [];
                const dateStr = exp.from ? `${exp.from} – ${exp.current ? "Present" : exp.to || ""}` : "";
                return (
                  <div key={exp.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{exp.role || "Role"}</p>
                        {exp.company && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{exp.company}</p>}
                      </div>
                      {dateStr && <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap", marginTop: "2px" }}>{dateStr}</p>}
                    </div>
                    {bullets.length > 0 && (
                      <ul style={{ margin: "6px 0 0 0", padding: 0, listStyle: "none" }}>
                        {bullets.map((b, i) => (
                          <li key={i} style={{ display: "flex", gap: "8px", marginBottom: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.55 }}>
                            <span style={{ color: accent, flexShrink: 0 }}>›</span><span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!bullets.length && exp.description && <p style={{ marginTop: "4px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>{exp.description}</p>}
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
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{edu.degree || "Degree"}{edu.field ? ` in ${edu.field}` : ""}</p>
                    {edu.institution && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{edu.institution}</p>}
                  </div>
                  {(edu.from || edu.to) && <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap", marginTop: "2px" }}>{edu.from}{edu.to ? ` – ${edu.to}` : ""}</p>}
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{cv.skills.map(chip)}</div>
          </div>
        );

      case "languages":
        if (!cv.languages?.length) return null;
        return (
          <div key="languages" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Languages" />
            <p style={{ fontSize: em(basePx), color: "#374151" }}>{cv.languages.join(" · ")}</p>
          </div>
        );

      case "certifications":
        if (!cv.certifications?.length) return null;
        return (
          <div key="certifications" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Certificates" />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {cv.certifications.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{c.name || "Certification"}</span>
                    {c.issuer && <span style={{ fontSize: em(basePx * 0.9), color: "#6b7280" }}> — {c.issuer}</span>}
                  </div>
                  {c.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case "interests":
        if (!cv.interests?.length) return null;
        return (
          <div key="interests" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Interests" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{cv.interests.map(chip)}</div>
          </div>
        );

      case "projects":
        if (!cv.projects?.length) return null;
        return (
          <div key="projects" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Projects" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.7) }}>
              {cv.projects.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{p.title || "Project"}</p>
                    {(p.from || p.to) && <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap" }}>{p.from}{p.to ? ` – ${p.to}` : ""}</p>}
                  </div>
                  {p.description && <p style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }}>{p.description}</p>}
                  {p.link && <p style={{ marginTop: "3px", fontSize: em(basePx * 0.85), color: accent }}>{p.link}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "courses":
        if (!cv.courses?.length) return null;
        return (
          <div key="courses" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Courses" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.5) }}>
              {cv.courses.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{c.name || "Course"}</span>
                    {c.provider && <span style={{ fontSize: em(basePx * 0.9), color: "#6b7280" }}> · {c.provider}</span>}
                  </div>
                  {c.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        );

      case "awards":
        if (!cv.awards?.length) return null;
        return (
          <div key="awards" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Awards" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.awards.map((a) => (
                <div key={a.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{a.title || "Award"}</p>
                    {a.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{a.date}</span>}
                  </div>
                  {a.issuer && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{a.issuer}</p>}
                  {a.description && <p style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }}>{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "organisations":
        if (!cv.organisations?.length) return null;
        return (
          <div key="organisations" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Organisations" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.7) }}>
              {cv.organisations.map((o) => (
                <div key={o.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{o.name || "Organisation"}</p>
                      {o.role && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{o.role}</p>}
                    </div>
                    {(o.from || o.to) && <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap" }}>{o.from}{o.to ? ` – ${o.to}` : ""}</p>}
                  </div>
                  {o.description && <p style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }}>{o.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "publications":
        if (!cv.publications?.length) return null;
        return (
          <div key="publications" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Publications" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.publications.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{p.title || "Publication"}</p>
                    {p.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{p.date}</span>}
                  </div>
                  {p.publisher && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{p.publisher}</p>}
                  {p.description && <p style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }}>{p.description}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "references":
        if (!cv.references?.length) return null;
        return (
          <div key="references" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="References" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.references.map((r) => (
                <div key={r.id}>
                  <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{r.name || "Reference"}</p>
                  {(r.jobTitle || r.company) && <p style={{ fontSize: em(basePx * 0.9), color: "#6b7280" }}>{[r.jobTitle, r.company].filter(Boolean).join(", ")}</p>}
                  <div style={{ display: "flex", gap: "12px", marginTop: "2px" }}>
                    {r.email && <span style={{ fontSize: em(basePx * 0.85), color: "#9ca3af" }}>{r.email}</span>}
                    {r.phone && <span style={{ fontSize: em(basePx * 0.85), color: "#9ca3af" }}>{r.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "declaration":
        if (!cv.declaration) return null;
        return (
          <div key="declaration" style={{ marginBottom: px(gap) }}>
            <SectionHeading title="Declaration" />
            <p style={{ fontSize: em(basePx), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>{cv.declaration}</p>
          </div>
        );

      case "custom":
        if (!cv.customSections?.length) return null;
        return (
          <div key="custom">
            {cv.customSections.map((cs) => (
              <div key={cs.id} style={{ marginBottom: px(gap) }}>
                <SectionHeading title={cs.title || "Custom Section"} />
                <p style={{ fontSize: em(basePx), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>{cs.content}</p>
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  };

  const hasContact = contact.email || contact.phone || contact.location || contact.website;
  const showLinkedIn = addedSections.includes("linkedin") && !hiddenFromPreview.has("linkedin") && !!cv.linkedinAbout;

  return (
    <div id="cv-preview-panel" style={{ background: "#ffffff", fontFamily: ff, fontSize: px(basePx), color: "#111827", minHeight: "700px", boxShadow: "0 4px 32px rgba(0,0,0,0.15)", borderRadius: "8px", overflow: "hidden" }}>
      <div style={{ borderBottom: `3px solid ${accent}`, padding: "28px 32px 22px" }}>
        <p style={{ fontSize: px(basePx * 1.85), fontWeight: 700, color: "#0f172a", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{name || "Your Name"}</p>
        {cv.headline && <p style={{ fontSize: px(basePx * 1.02), color: accent, fontWeight: 500, marginTop: "5px" }}>{cv.headline}</p>}
        {hasContact && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "10px" }}>
            {contact.email    && <span style={{ fontSize: px(basePx * 0.82), color: "#6b7280" }}>✉ {contact.email}</span>}
            {contact.phone    && <span style={{ fontSize: px(basePx * 0.82), color: "#6b7280" }}>✆ {contact.phone}</span>}
            {contact.location && <span style={{ fontSize: px(basePx * 0.82), color: "#6b7280" }}>⌖ {contact.location}</span>}
            {contact.website  && <span style={{ fontSize: px(basePx * 0.82), color: "#6b7280" }}>⊕ {contact.website}</span>}
          </div>
        )}
      </div>
      <div style={{ padding: "24px 32px" }}>
        {visibleSections.map((id) => renderSection(id))}
      </div>
      {showLinkedIn && (
        <div style={{ borderTop: "1px dashed #e5e7eb", margin: "0 32px", padding: "18px 0" }}>
          <p style={{ fontSize: px(basePx * 0.72), fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, marginBottom: "8px" }}>LinkedIn About</p>
          <p style={{ fontSize: px(basePx * 0.92), color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line" }}>{cv.linkedinAbout}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CVBuilder({ candidateId, candidateName, initialCv }: {
  candidateId: string; candidateName: string; initialCv: CVProfile | null;
}) {
  const [cv,               setCv]              = useState<CVProfile>(initialCv ?? EMPTY_CV);
  const [saving,           setSaving]          = useState(false);
  const [saved,            setSaved]           = useState(false);
  const [addedSections,    setAddedSections]   = useState<string[]>(() => initialCv?.sectionOrder ?? []);
  const [hiddenFromPreview,setHiddenFromPreview] = useState<Set<string>>(new Set());
  const [openSection,      setOpenSection]     = useState<string | null>(null);
  const [dragItem,         setDragItem]        = useState<string | null>(null);
  const [dragOver,         setDragOver]        = useState<string | null>(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "cv-print-style";
    el.textContent = `@media print { body * { visibility: hidden !important; } #cv-preview-panel, #cv-preview-panel * { visibility: visible !important; } #cv-preview-panel { position: fixed !important; inset: 0 !important; border-radius: 0 !important; box-shadow: none !important; } @page { margin: 12mm 14mm; size: A4; } }`;
    document.head.appendChild(el);
    return () => { document.getElementById("cv-print-style")?.remove(); };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────────

  function setStyle(p: Partial<CVStyle>) { setCv((prev) => ({ ...prev, style: { ...DEFAULT_STYLE, ...(prev.style ?? {}), ...p } })); }
  function setContact(c: CVContact) { setCv((prev) => ({ ...prev, contact: c })); }

  function addSection(id: string) { setAddedSections((p) => [...p, id]); setOpenSection(id); }
  function removeSection(id: string) {
    setAddedSections((p) => p.filter((s) => s !== id));
    setHiddenFromPreview((p) => { const n = new Set(p); n.delete(id); return n; });
    if (openSection === id) setOpenSection(null);
  }
  function toggleHidden(id: string) {
    setHiddenFromPreview((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); if (dragItem && dragItem !== id) setDragOver(id); }
  function handleDrop(targetId: string) {
    if (!dragItem || dragItem === targetId) { setDragItem(null); setDragOver(null); return; }
    const from = addedSections.indexOf(dragItem), to = addedSections.indexOf(targetId);
    if (from === -1 || to === -1) return;
    const next = [...addedSections]; next.splice(from, 1); next.splice(to, 0, dragItem);
    setAddedSections(next); setDragItem(null); setDragOver(null);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/candidates/${candidateId}/cv`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...cv, sectionOrder: addedSections }),
    });
    setCv((p) => ({ ...p, sectionOrder: addedSections }));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Array helpers ─────────────────────────────────────────────────────────────

  function listHelpers<T extends { id: string }>(key: keyof CVProfile) {
    return {
      update: (id: string, patch: Partial<T>) =>
        setCv((p) => ({ ...p, [key]: (p[key] as T[]).map((x) => x.id === id ? { ...x, ...patch } : x) })),
      remove: (id: string) =>
        setCv((p) => ({ ...p, [key]: (p[key] as T[]).filter((x) => x.id !== id) })),
      add: (item: T) =>
        setCv((p) => ({ ...p, [key]: [...((p[key] as T[]) ?? []), item] })),
    };
  }

  const exp  = listHelpers<CVExperience>("experience");
  const edu  = listHelpers<CVEducation>("education");
  const cert = listHelpers<CVCertification>("certifications");
  const proj = listHelpers<CVProject>("projects");
  const crs  = listHelpers<CVCourse>("courses");
  const awd  = listHelpers<CVAward>("awards");
  const org  = listHelpers<CVOrganisation>("organisations");
  const pub  = listHelpers<CVPublication>("publications");
  const ref  = listHelpers<CVReference>("references");
  const cust = listHelpers<CVCustomSection>("customSections");

  function generateLinkedIn() {
    const latest = cv.experience[0];
    const role   = latest ? `Currently ${latest.role} at ${latest.company}. ` : "";
    const skills = cv.skills.length > 0 ? `\n\nCore skills: ${cv.skills.slice(0, 6).join(", ")}.` : "";
    setCv((p) => ({ ...p, linkedinAbout: [cv.headline, "\n\n", cv.summary, "\n\n", role, skills].join("").trim().slice(0, 2000) }));
  }

  // ── Entry card wrapper ────────────────────────────────────────────────────────

  function EntryCard({ label, onRemove, children }: { label: string; onRemove: () => void; children: React.ReactNode }) {
    return (
      <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <button onClick={onRemove} className="text-muted-foreground/30 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
        </div>
        {children}
      </div>
    );
  }

  // ── Section editor renderers ──────────────────────────────────────────────────

  function renderSectionEditor(id: string) {
    switch (id) {
      case "summary":
        return (
          <textarea value={cv.summary} onChange={(e) => setCv((p) => ({ ...p, summary: e.target.value }))}
            rows={4} placeholder="A concise paragraph describing your career, key strengths, and what you bring to the table…"
            className={cn(inputCls, "resize-none text-sm")} />
        );

      case "experience":
        return (
          <div className="space-y-4">
            {cv.experience.map((e, i) => (
              <EntryCard key={e.id} label={`Position ${i + 1}`} onRemove={() => exp.remove(e.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Job Title</label><input value={e.role} onChange={(ev) => exp.update(e.id, { role: ev.target.value })} placeholder="e.g. Product Manager" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Company</label><input value={e.company} onChange={(ev) => exp.update(e.id, { company: ev.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>From</label><input value={e.from} onChange={(ev) => exp.update(e.id, { from: ev.target.value })} placeholder="Jan 2020" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>To</label>
                    <div className="flex items-center gap-1.5">
                      <input value={e.current ? "" : e.to} onChange={(ev) => exp.update(e.id, { to: ev.target.value })} placeholder={e.current ? "Present" : "Dec 2023"} disabled={e.current} className={cn(inputCls, "flex-1 text-xs py-1.5")} />
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer shrink-0"><input type="checkbox" checked={e.current} onChange={(ev) => exp.update(e.id, { current: ev.target.checked })} /> Now</label>
                    </div>
                  </div>
                </div>
                <BulletListInput bullets={e.bullets ?? [""]} onChange={(b) => exp.update(e.id, { bullets: b })} />
              </EntryCard>
            ))}
            <button onClick={() => exp.add(newExp())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Position</button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {cv.education.map((e, i) => (
              <EntryCard key={e.id} label={`Entry ${i + 1}`} onRemove={() => edu.remove(e.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Institution</label><input value={e.institution} onChange={(ev) => edu.update(e.id, { institution: ev.target.value })} placeholder="e.g. University of Manchester" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Degree</label><input value={e.degree} onChange={(ev) => edu.update(e.id, { degree: ev.target.value })} placeholder="e.g. BSc, MBA" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Field of Study</label><input value={e.field} onChange={(ev) => edu.update(e.id, { field: ev.target.value })} placeholder="e.g. Computer Science" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><label className={labelCls}>From</label><input value={e.from} onChange={(ev) => edu.update(e.id, { from: ev.target.value })} placeholder="2018" className={cn(inputCls, "text-xs py-1.5")} /></div>
                    <div><label className={labelCls}>To</label><input value={e.to} onChange={(ev) => edu.update(e.id, { to: ev.target.value })} placeholder="2021" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  </div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => edu.add(newEdu())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Education</button>
          </div>
        );

      case "skills":
        return <ChipInput chips={cv.skills} placeholder="Type a skill and press Enter…" onChange={(c) => setCv((p) => ({ ...p, skills: c }))} />;

      case "languages":
        return <ChipInput chips={cv.languages ?? []} placeholder="e.g. English (Fluent)…" onChange={(c) => setCv((p) => ({ ...p, languages: c }))} />;

      case "certifications":
        return (
          <div className="space-y-3">
            {(cv.certifications ?? []).map((c, i) => (
              <EntryCard key={c.id} label={`Cert ${i + 1}`} onRemove={() => cert.remove(c.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Certification Name</label><input value={c.name} onChange={(e) => cert.update(c.id, { name: e.target.value })} placeholder="e.g. AWS Solutions Architect" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Issuer</label><input value={c.issuer} onChange={(e) => cert.update(c.id, { issuer: e.target.value })} placeholder="e.g. Amazon Web Services" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><input value={c.date} onChange={(e) => cert.update(c.id, { date: e.target.value })} placeholder="e.g. June 2023" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => cert.add(newCert())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Certification</button>
          </div>
        );

      case "interests":
        return <ChipInput chips={cv.interests ?? []} placeholder="e.g. Photography, Hiking…" onChange={(c) => setCv((p) => ({ ...p, interests: c }))} />;

      case "projects":
        return (
          <div className="space-y-4">
            {(cv.projects ?? []).map((p, i) => (
              <EntryCard key={p.id} label={`Project ${i + 1}`} onRemove={() => proj.remove(p.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Project Title</label><input value={p.title} onChange={(e) => proj.update(p.id, { title: e.target.value })} placeholder="e.g. E-commerce Platform" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>From</label><input value={p.from ?? ""} onChange={(e) => proj.update(p.id, { from: e.target.value })} placeholder="Jan 2023" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>To</label><input value={p.to ?? ""} onChange={(e) => proj.update(p.id, { to: e.target.value })} placeholder="Jun 2023" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Link</label><input value={p.link ?? ""} onChange={(e) => proj.update(p.id, { link: e.target.value })} placeholder="https://github.com/…" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><textarea value={p.description} onChange={(e) => proj.update(p.id, { description: e.target.value })} rows={2} placeholder="Describe the project, your role, and impact…" className={cn(inputCls, "resize-none text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => proj.add(newProj())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Project</button>
          </div>
        );

      case "courses":
        return (
          <div className="space-y-3">
            {(cv.courses ?? []).map((c, i) => (
              <EntryCard key={c.id} label={`Course ${i + 1}`} onRemove={() => crs.remove(c.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Course Name</label><input value={c.name} onChange={(e) => crs.update(c.id, { name: e.target.value })} placeholder="e.g. Machine Learning Specialization" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Provider</label><input value={c.provider} onChange={(e) => crs.update(c.id, { provider: e.target.value })} placeholder="e.g. Coursera" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><input value={c.date ?? ""} onChange={(e) => crs.update(c.id, { date: e.target.value })} placeholder="e.g. 2023" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => crs.add(newCourse())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Course</button>
          </div>
        );

      case "awards":
        return (
          <div className="space-y-3">
            {(cv.awards ?? []).map((a, i) => (
              <EntryCard key={a.id} label={`Award ${i + 1}`} onRemove={() => awd.remove(a.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Award Title</label><input value={a.title} onChange={(e) => awd.update(a.id, { title: e.target.value })} placeholder="e.g. Employee of the Year" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Issuer</label><input value={a.issuer} onChange={(e) => awd.update(a.id, { issuer: e.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><input value={a.date ?? ""} onChange={(e) => awd.update(a.id, { date: e.target.value })} placeholder="e.g. 2022" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><textarea value={a.description ?? ""} onChange={(e) => awd.update(a.id, { description: e.target.value })} rows={2} placeholder="Brief description…" className={cn(inputCls, "resize-none text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => awd.add(newAward())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Award</button>
          </div>
        );

      case "organisations":
        return (
          <div className="space-y-3">
            {(cv.organisations ?? []).map((o, i) => (
              <EntryCard key={o.id} label={`Organisation ${i + 1}`} onRemove={() => org.remove(o.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Organisation Name</label><input value={o.name} onChange={(e) => org.update(o.id, { name: e.target.value })} placeholder="e.g. Rotary Club" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Your Role</label><input value={o.role} onChange={(e) => org.update(o.id, { role: e.target.value })} placeholder="e.g. Volunteer" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>From</label><input value={o.from ?? ""} onChange={(e) => org.update(o.id, { from: e.target.value })} placeholder="2020" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>To</label><input value={o.to ?? ""} onChange={(e) => org.update(o.id, { to: e.target.value })} placeholder="Present" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><textarea value={o.description ?? ""} onChange={(e) => org.update(o.id, { description: e.target.value })} rows={2} placeholder="Your contribution and activities…" className={cn(inputCls, "resize-none text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => org.add(newOrg())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Organisation</button>
          </div>
        );

      case "publications":
        return (
          <div className="space-y-3">
            {(cv.publications ?? []).map((p, i) => (
              <EntryCard key={p.id} label={`Publication ${i + 1}`} onRemove={() => pub.remove(p.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Title</label><input value={p.title} onChange={(e) => pub.update(p.id, { title: e.target.value })} placeholder="e.g. The Future of AI in Healthcare" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Publisher / Journal</label><input value={p.publisher} onChange={(e) => pub.update(p.id, { publisher: e.target.value })} placeholder="e.g. Nature" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><input value={p.date ?? ""} onChange={(e) => pub.update(p.id, { date: e.target.value })} placeholder="e.g. Mar 2024" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Link</label><input value={p.link ?? ""} onChange={(e) => pub.update(p.id, { link: e.target.value })} placeholder="https://…" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => pub.add(newPub())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Publication</button>
          </div>
        );

      case "references":
        return (
          <div className="space-y-3">
            {(cv.references ?? []).map((r, i) => (
              <EntryCard key={r.id} label={`Reference ${i + 1}`} onRemove={() => ref.remove(r.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Full Name</label><input value={r.name} onChange={(e) => ref.update(r.id, { name: e.target.value })} placeholder="e.g. Jane Smith" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Job Title</label><input value={r.jobTitle ?? ""} onChange={(e) => ref.update(r.id, { jobTitle: e.target.value })} placeholder="e.g. Head of Engineering" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Company</label><input value={r.company ?? ""} onChange={(e) => ref.update(r.id, { company: e.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Email</label><input value={r.email ?? ""} onChange={(e) => ref.update(r.id, { email: e.target.value })} placeholder="jane@acme.com" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Phone</label><input value={r.phone ?? ""} onChange={(e) => ref.update(r.id, { phone: e.target.value })} placeholder="+44 7700 900000" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => ref.add(newRef())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Reference</button>
          </div>
        );

      case "declaration":
        return (
          <textarea value={cv.declaration ?? ""} onChange={(e) => setCv((p) => ({ ...p, declaration: e.target.value }))}
            rows={4} placeholder="I hereby declare that the information provided is true and accurate to the best of my knowledge…"
            className={cn(inputCls, "resize-none text-sm")} />
        );

      case "linkedin":
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">2,000 character LinkedIn &ldquo;About&rdquo; section</p>
              <button onClick={generateLinkedIn} className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                <Sparkles className="h-3 w-3" /> Auto-generate
              </button>
            </div>
            <textarea value={cv.linkedinAbout} onChange={(e) => setCv((p) => ({ ...p, linkedinAbout: e.target.value.slice(0, 2000) }))}
              rows={7} placeholder="Write a compelling LinkedIn About section…" className={cn(inputCls, "resize-none text-sm")} />
            <p className="text-right text-[10px] text-muted-foreground">{cv.linkedinAbout.length}/2000</p>
          </div>
        );

      case "custom":
        return (
          <div className="space-y-4">
            {(cv.customSections ?? []).map((cs, i) => (
              <EntryCard key={cs.id} label={`Section ${i + 1}`} onRemove={() => cust.remove(cs.id)}>
                <div className="space-y-2">
                  <div><label className={labelCls}>Section Title</label><input value={cs.title} onChange={(e) => cust.update(cs.id, { title: e.target.value })} placeholder="e.g. Volunteering" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Content</label><textarea value={cs.content} onChange={(e) => cust.update(cs.id, { content: e.target.value })} rows={3} placeholder="Add any content for this section…" className={cn(inputCls, "resize-none text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => cust.add(newCustom())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Custom Section</button>
          </div>
        );

      default: return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const currentStyle = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">CV Builder</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Fill in your details, then add sections below</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Printer className="h-3.5 w-3.5" /><span className="hidden sm:block">Print / PDF</span>
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr,440px]">
        <div className="space-y-3">
          <PersonalInfoCard name={candidateName} headline={cv.headline} contact={cv.contact ?? {}} accentColor={currentStyle.accentColor}
            onHeadlineChange={(v) => setCv((p) => ({ ...p, headline: v }))} onContactChange={setContact} />
          <AppearancePanel currentStyle={currentStyle} onStyleChange={setStyle} />

          {addedSections.map((id) => (
            <SectionRow key={id} sectionId={id} isOpen={openSection === id} isHidden={hiddenFromPreview.has(id)}
              onToggle={() => setOpenSection(openSection === id ? null : id)}
              onToggleVisibility={() => toggleHidden(id)}
              onRemove={() => removeSection(id)}
              onDragStart={() => setDragItem(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => { setDragItem(null); setDragOver(null); }}
              isDraggingOver={dragOver === id}>
              {renderSectionEditor(id)}
            </SectionRow>
          ))}

          <AddContentButton addedSections={addedSections} onAdd={addSection} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</p>
            <button onClick={() => window.print()} className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity">
              <Download className="h-3 w-3" /> Save as PDF
            </button>
          </div>
          <CVPreview cv={cv} name={candidateName} addedSections={addedSections} hiddenFromPreview={hiddenFromPreview} />
        </div>
      </div>
    </div>
  );
}
