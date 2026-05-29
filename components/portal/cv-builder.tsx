"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, Printer, Plus, X, GripVertical, Loader2,
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Download,
  Mail, Phone, MapPin, Globe, Briefcase, GraduationCap,
  Zap, Award, AlignLeft, Camera, Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVProfile, CVExperience, CVEducation, CVCertification, CVStyle, CVContact,
} from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: "Modern",       value: "Inter, system-ui, sans-serif" },
  { label: "Classic",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Professional", value: "Arial, Helvetica, sans-serif" },
  { label: "Elegant",      value: "'Palatino Linotype', Palatino, serif" },
];

const ACCENT_PRESETS = [
  "#e11d48",
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#1d4ed8",
  "#374151",
];

const SECTION_DEFS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: "summary",        label: "Professional Summary", icon: AlignLeft    },
  { id: "experience",     label: "Work Experience",      icon: Briefcase    },
  { id: "education",      label: "Education",            icon: GraduationCap },
  { id: "skills",         label: "Skills",               icon: Zap          },
  { id: "languages",      label: "Languages",            icon: Globe        },
  { id: "certifications", label: "Certifications",       icon: Award        },
];

const DEFAULT_ORDER = SECTION_DEFS.map((s) => s.id);

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
  sectionOrder: DEFAULT_ORDER,
  style:        DEFAULT_STYLE,
  contact:      {},
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

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 " +
  "focus:border-primary/40 transition-colors";
const labelCls = "block text-[11px] font-medium text-muted-foreground mb-1";

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
    const next = bullets.filter((_, idx) => idx !== i); onChange(next);
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
      <p className={labelCls}>Key Achievements &amp; Responsibilities</p>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-muted-foreground shrink-0 text-sm">•</span>
          <input
            ref={(el) => { inputRefs.current[i] = el; }}
            value={b}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKey(e, i)}
            placeholder="Achievement or responsibility… (Enter to add more)"
            className={cn(inputCls, "text-xs py-1.5")}
          />
          <button onClick={() => remove(i)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        onClick={() => addAfter(bullets.length - 1)}
        className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors mt-1"
      >
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
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className={cn(inputCls, "text-xs py-1.5")}
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors"
        >
          Add
        </button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs text-foreground"
            >
              {c}
              <button
                onClick={() => onChange(chips.filter((x) => x !== c))}
                className="text-muted-foreground/50 hover:text-rose-400 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Personal Info Card ───────────────────────────────────────────────────────

function PersonalInfoCard({
  name,
  headline,
  contact,
  accentColor,
  onHeadlineChange,
  onContactChange,
}: {
  name: string;
  headline: string;
  contact: CVContact;
  accentColor: string;
  onHeadlineChange: (v: string) => void;
  onContactChange: (c: CVContact) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Accent bar */}
      <div
        className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }}
      />

      <div className="p-5">
        <div className="flex gap-4 items-start">
          {/* Avatar placeholder */}
          <div className="shrink-0">
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-border/50 bg-muted/30 flex flex-col items-center justify-center gap-0.5 cursor-default group">
              <Camera className="h-5 w-5 text-muted-foreground/30" />
              <span className="text-[9px] text-muted-foreground/30">Photo</span>
            </div>
          </div>

          {/* Name + headline */}
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground leading-tight">{name || "Your Name"}</p>
            <input
              value={headline}
              onChange={(e) => onHeadlineChange(e.target.value)}
              placeholder="Professional headline, e.g. Senior Product Manager"
              className={cn(inputCls, "mt-2 text-sm")}
            />
          </div>
        </div>

        {/* Contact fields */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors">
            <Mail className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <input
              value={contact.email ?? ""}
              onChange={(e) => onContactChange({ ...contact, email: e.target.value })}
              placeholder="Email address"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors">
            <Phone className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <input
              value={contact.phone ?? ""}
              onChange={(e) => onContactChange({ ...contact, phone: e.target.value })}
              placeholder="Phone number"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <input
              value={contact.location ?? ""}
              onChange={(e) => onContactChange({ ...contact, location: e.target.value })}
              placeholder="City, Country"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors">
            <Globe className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <input
              value={contact.website ?? ""}
              onChange={(e) => onContactChange({ ...contact, website: e.target.value })}
              placeholder="LinkedIn or website URL"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Appearance Panel ─────────────────────────────────────────────────────────

function AppearancePanel({
  currentStyle,
  onStyleChange,
}: {
  currentStyle: CVStyle;
  onStyleChange: (p: Partial<CVStyle>) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${currentStyle.accentColor}22` }}
        >
          <Palette className="h-4 w-4" style={{ color: currentStyle.accentColor }} />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">Appearance</span>
        <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] text-muted-foreground capitalize hidden sm:block">
          {currentStyle.fontFamily.split(",")[0]}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-4">
          {/* Accent colour */}
          <div>
            <p className={labelCls}>Accent Colour</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  onClick={() => onStyleChange({ accentColor: c })}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all",
                    currentStyle.accentColor === c
                      ? "scale-125 ring-2 ring-offset-2 ring-offset-card ring-white/30"
                      : "hover:scale-110 opacity-80 hover:opacity-100"
                  )}
                  style={{ background: c }}
                />
              ))}
              <label className="cursor-pointer" title="Custom colour">
                <input
                  type="color"
                  value={currentStyle.accentColor}
                  onChange={(e) => onStyleChange({ accentColor: e.target.value })}
                  className="sr-only"
                />
                <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold">
                  +
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Font */}
            <div>
              <p className={labelCls}>Font</p>
              <select
                value={currentStyle.fontFamily}
                onChange={(e) => onStyleChange({ fontFamily: e.target.value })}
                className="w-full rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div>
              <p className={labelCls}>Text Size</p>
              <div className="flex rounded-lg border border-border/60 overflow-hidden">
                {(["sm", "md", "lg"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => onStyleChange({ fontSize: s })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium transition-colors",
                      currentStyle.fontSize === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                  </button>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <p className={labelCls}>Spacing</p>
              <div className="flex rounded-lg border border-border/60 overflow-hidden">
                {(["compact", "normal", "relaxed"] as const).map((s, i) => (
                  <button
                    key={s}
                    onClick={() => onStyleChange({ spacing: s })}
                    title={s}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium transition-colors",
                      currentStyle.spacing === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    {["C", "N", "R"][i]}
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
  const def  = SECTION_DEFS.find((s) => s.id === sectionId);
  const Icon = def?.icon ?? AlignLeft;

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded-2xl border bg-card overflow-hidden shadow-sm transition-all",
        isDraggingOver
          ? "border-primary/50 bg-primary/5 shadow-md translate-y-[-2px]"
          : "border-border/60 hover:border-border",
        isHidden && "opacity-50"
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Section icon */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/60">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Label */}
        <button
          onClick={onToggle}
          className="flex-1 text-left text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
        >
          {def?.label ?? sectionId}
        </button>

        {/* Visibility */}
        <button
          onClick={onToggleVisibility}
          title={isHidden ? "Show in CV" : "Hide from CV"}
          className={cn(
            "rounded-lg p-1.5 transition-colors",
            isHidden
              ? "text-muted-foreground/30 hover:text-muted-foreground"
              : "text-muted-foreground/60 hover:text-foreground"
          )}
        >
          {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>

        {/* Drag handle */}
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing rounded-lg p-1.5 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Expand/collapse */}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Expanded editor */}
      {isOpen && (
        <div className="border-t border-border/40 px-4 pb-4 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Add Content Button ───────────────────────────────────────────────────────

function AddContentButton({
  hiddenSections,
  onShow,
}: {
  hiddenSections: Set<string>;
  onShow: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const hiddenDefs = SECTION_DEFS.filter((s) => hiddenSections.has(s.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}
      >
        <Plus className="h-4 w-4" />
        Add Content
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-2 z-10 rounded-2xl border border-border/60 bg-popover shadow-xl overflow-hidden">
          {hiddenDefs.length > 0 ? (
            <>
              <p className="px-4 py-2.5 text-[11px] font-medium text-muted-foreground border-b border-border/40">
                Hidden sections — click to restore
              </p>
              {hiddenDefs.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => { onShow(s.id); setOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    {s.label}
                  </button>
                );
              })}
            </>
          ) : (
            <p className="px-4 py-3 text-xs text-muted-foreground text-center">
              All sections are already visible
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────

function CVPreview({
  cv,
  name,
  hiddenSections,
}: {
  cv: CVProfile;
  name: string;
  hiddenSections: Set<string>;
}) {
  const style   = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };
  const accent  = style.accentColor;
  const ff      = style.fontFamily;
  const basePx  = FONT_SIZE_PX[style.fontSize ?? "md"];
  const gap     = SPACING_GAP[style.spacing ?? "normal"];
  const order   = (cv.sectionOrder ?? DEFAULT_ORDER).filter((id) => !hiddenSections.has(id));
  const contact = cv.contact ?? {};

  const px = (n: number) => `${n}px`;
  const em = (n: number) => `${(n / basePx).toFixed(3)}em`;

  function SectionHeading({ title }: { title: string }) {
    return (
      <div style={{ marginBottom: px(gap * 0.5) }}>
        <p style={{
          fontSize: em(basePx * 0.72), fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          color: accent, marginBottom: "4px",
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
            <SectionHeading title="Work Experience" />
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
                  {cert.date && (
                    <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{cert.date}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  const hasContact = contact.email || contact.phone || contact.location || contact.website;

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
        borderRadius: "8px",
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
        {hasContact && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
            {contact.email && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: px(basePx * 0.82), color: "#6b7280" }}>
                <span style={{ color: accent }}>✉</span> {contact.email}
              </span>
            )}
            {contact.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: px(basePx * 0.82), color: "#6b7280" }}>
                <span style={{ color: accent }}>✆</span> {contact.phone}
              </span>
            )}
            {contact.location && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: px(basePx * 0.82), color: "#6b7280" }}>
                <span style={{ color: accent }}>⌖</span> {contact.location}
              </span>
            )}
            {contact.website && (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: px(basePx * 0.82), color: "#6b7280" }}>
                <span style={{ color: accent }}>⊕</span> {contact.website}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Body sections */}
      <div style={{ padding: "24px 32px" }}>
        {order.map((id) => renderSection(id))}
      </div>

      {/* LinkedIn About */}
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
  const [cv,             setCv]           = useState<CVProfile>(initialCv ?? EMPTY_CV);
  const [saving,         setSaving]       = useState(false);
  const [saved,          setSaved]        = useState(false);
  const [openSection,    setOpenSection]  = useState<string | null>("experience");
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [dragItem,       setDragItem]     = useState<string | null>(null);
  const [dragOver,       setDragOver]     = useState<string | null>(null);

  // Inject print CSS on mount
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "cv-print-style";
    el.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #cv-preview-panel, #cv-preview-panel * { visibility: visible !important; }
        #cv-preview-panel {
          position: fixed !important; inset: 0 !important;
          border-radius: 0 !important; box-shadow: none !important;
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
    setCv((p) => ({ ...p, style: { ...DEFAULT_STYLE, ...(p.style ?? {}), ...partial } }));
  }
  function setContact(c: CVContact) {
    setCv((p) => ({ ...p, contact: c }));
  }
  function toggleHidden(id: string) {
    setHiddenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function showSection(id: string) {
    setHiddenSections((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  // ── Drag ─────────────────────────────────────────────────────────────────────

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
            className={cn(inputCls, "resize-none text-sm")}
          />
        );

      case "experience":
        return (
          <div className="space-y-4">
            {cv.experience.map((exp, i) => (
              <div key={exp.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Position {i + 1}</p>
                  <button onClick={() => removeExp(exp.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Job Title</label>
                    <input value={exp.role} onChange={(e) => updateExp(exp.id, { role: e.target.value })}
                      placeholder="e.g. Product Manager" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input value={exp.company} onChange={(e) => updateExp(exp.id, { company: e.target.value })}
                      placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>From</label>
                    <input value={exp.from} onChange={(e) => updateExp(exp.id, { from: e.target.value })}
                      placeholder="Jan 2020" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>To</label>
                    <div className="flex items-center gap-1.5">
                      <input value={exp.current ? "" : exp.to}
                        onChange={(e) => updateExp(exp.id, { to: e.target.value })}
                        placeholder={exp.current ? "Present" : "Dec 2023"}
                        disabled={exp.current}
                        className={cn(inputCls, "flex-1 text-xs py-1.5")} />
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
            <button
              onClick={() => setCv((p) => ({ ...p, experience: [...p.experience, newExp()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
            >
              <Plus className="h-3.5 w-3.5" /> Add Position
            </button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {cv.education.map((edu, i) => (
              <div key={edu.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Entry {i + 1}</p>
                  <button onClick={() => removeEdu(edu.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Institution</label>
                    <input value={edu.institution} onChange={(e) => updateEdu(edu.id, { institution: e.target.value })}
                      placeholder="e.g. University of Manchester" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Degree</label>
                    <input value={edu.degree} onChange={(e) => updateEdu(edu.id, { degree: e.target.value })}
                      placeholder="e.g. BSc, MBA" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Field of Study</label>
                    <input value={edu.field} onChange={(e) => updateEdu(edu.id, { field: e.target.value })}
                      placeholder="e.g. Computer Science" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <label className={labelCls}>From</label>
                      <input value={edu.from} onChange={(e) => updateEdu(edu.id, { from: e.target.value })}
                        placeholder="2018" className={cn(inputCls, "text-xs py-1.5")} />
                    </div>
                    <div>
                      <label className={labelCls}>To</label>
                      <input value={edu.to} onChange={(e) => updateEdu(edu.id, { to: e.target.value })}
                        placeholder="2021" className={cn(inputCls, "text-xs py-1.5")} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setCv((p) => ({ ...p, education: [...p.education, newEdu()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
            >
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
              <div key={cert.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Cert {i + 1}</p>
                  <button onClick={() => removeCert(cert.id)} className="text-muted-foreground/40 hover:text-rose-400 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className={labelCls}>Certification Name</label>
                    <input value={cert.name} onChange={(e) => updateCert(cert.id, { name: e.target.value })}
                      placeholder="e.g. AWS Solutions Architect" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Issuer</label>
                    <input value={cert.issuer} onChange={(e) => updateCert(cert.id, { issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Date</label>
                    <input value={cert.date} onChange={(e) => updateCert(cert.id, { date: e.target.value })}
                      placeholder="e.g. June 2023" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setCv((p) => ({ ...p, certifications: [...(p.certifications ?? []), newCert()] }))}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
            >
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
    <div className="space-y-5">
      {/* ── Top action bar ─────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">CV Builder</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag sections to reorder · eye icon hides from CV
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Print / PDF</span>
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Split: Editor | Preview ──────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr,440px]">

        {/* LEFT — editor */}
        <div className="space-y-3">
          {/* Personal info card */}
          <PersonalInfoCard
            name={candidateName}
            headline={cv.headline}
            contact={cv.contact ?? {}}
            accentColor={currentStyle.accentColor}
            onHeadlineChange={(v) => setCv((p) => ({ ...p, headline: v }))}
            onContactChange={setContact}
          />

          {/* Appearance */}
          <AppearancePanel currentStyle={currentStyle} onStyleChange={setStyle} />

          {/* Section cards */}
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

          {/* LinkedIn About */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenSection(openSection === "linkedin" ? null : "linkedin")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/60">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">LinkedIn About</span>
              {openSection === "linkedin"
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {openSection === "linkedin" && (
              <div className="border-t border-border/40 px-4 pb-4 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">2,000 character LinkedIn &ldquo;About&rdquo; section</p>
                  <button
                    onClick={generateLinkedIn}
                    className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate
                  </button>
                </div>
                <textarea
                  value={cv.linkedinAbout}
                  onChange={(e) => setCv((p) => ({ ...p, linkedinAbout: e.target.value.slice(0, 2000) }))}
                  rows={7}
                  placeholder="Write a compelling LinkedIn About section…"
                  className={cn(inputCls, "resize-none text-sm")}
                />
                <p className="text-right text-[10px] text-muted-foreground">{cv.linkedinAbout.length}/2000</p>
              </div>
            )}
          </div>

          {/* Add Content button */}
          <AddContentButton hiddenSections={hiddenSections} onShow={showSection} />
        </div>

        {/* RIGHT — Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 text-xs text-primary hover:opacity-80 transition-opacity"
            >
              <Download className="h-3 w-3" /> Save as PDF
            </button>
          </div>
          <CVPreview cv={cv} name={candidateName} hiddenSections={hiddenSections} />
        </div>
      </div>
    </div>
  );
}
