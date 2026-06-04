"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Save, Printer, Plus, X, GripVertical, Loader2,
  ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, Download,
  Mail, Phone, MapPin, Globe, Briefcase, GraduationCap,
  Zap, Award, AlignLeft, Camera, Palette, CalendarDays,
  Heart, FolderOpen, BookOpen, Trophy,
  FileText, UserCheck, PenLine, Puzzle,
  Bold, Italic, Underline, List, ListOrdered, Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CVProfile, CVExperience, CVEducation, CVCertification, CVStyle, CVContact,
  CVLanguage, CVProject, CVCourse, CVAward,
  CVPublication, CVReference, CVCustomSection, CVCustomEntry,
} from "@/lib/types";

// ─── Constants ─────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  { label: "Modern",       value: "Inter, system-ui, sans-serif" },
  { label: "Classic",      value: "Georgia, 'Times New Roman', serif" },
  { label: "Professional", value: "Arial, Helvetica, sans-serif" },
  { label: "Elegant",      value: "'Palatino Linotype', Palatino, serif" },
];

const ACCENT_PRESETS = [
  "#e11d48","#2563eb","#16a34a","#7c3aed",
  "#ea580c","#0891b2","#1d4ed8","#374151",
];

const PROFICIENCY_LEVELS = ["Native","Fluent","Advanced","Intermediate","Basic"] as const;

const ALL_SECTIONS: { id: string; label: string; icon: React.ElementType; description: string; dashed?: boolean }[] = [
  { id: "summary",        label: "Professional Summary",   icon: AlignLeft,     description: "A brief overview of your professional background and key strengths." },
  { id: "experience",     label: "Professional Experience", icon: Briefcase,     description: "Your professional roles and employer history including internships." },
  { id: "education",      label: "Education",              icon: GraduationCap, description: "Degrees and schools — include your focus, honours, or exchange terms." },
  { id: "skills",         label: "Skills",                 icon: Zap,           description: "Hard and soft skills that help you stand out from the crowd." },
  { id: "languages",      label: "Languages",              icon: Globe,         description: "Languages and proficiency level to show your communication range." },
  { id: "certifications", label: "Certificates",           icon: Award,         description: "Industry certificates or licences — include issuer and date earned." },
  { id: "interests",      label: "Interests",              icon: Heart,         description: "Personal interests that support your career story and cultural fit." },
  { id: "projects",       label: "Projects",               icon: FolderOpen,    description: "Key projects you participated in — highlight your role and impact." },
  { id: "courses",        label: "Courses",                icon: BookOpen,      description: "Online or in-person courses and trainings you completed." },
  { id: "awards",         label: "Awards",                 icon: Trophy,        description: "Awards and recognitions from industry, competitions, or academia." },
  { id: "publications",   label: "Publications",           icon: FileText,      description: "Publications, articles, or books you wrote or contributed to." },
  { id: "references",     label: "References",             icon: UserCheck,     description: "References from managers or coworkers, including contact details." },
  { id: "declaration",    label: "Declaration",            icon: PenLine,       description: "A personal declaration statement for your CV." },
  { id: "custom",         label: "Custom",                 icon: Puzzle,        description: "A fully custom section for anything else — add dates, titles, and more.", dashed: true },
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
  publications: [], references: [],
  declaration: "", customSections: [],
  sectionOrder: [], style: DEFAULT_STYLE, contact: {},
};

const FONT_SIZE_PX: Record<string, number> = { sm: 12.5, md: 13.5, lg: 15 };
const SPACING_GAP: Record<string, number>  = { compact: 10, normal: 18, relaxed: 28 };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Utils ────────────────────────────────────────────────────────────────────

function uid() { return `cv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }

// Migrate old string[] languages from existing saved CVs
function migrateLangs(raw: unknown): CVLanguage[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  if (typeof raw[0] === "string") return (raw as string[]).map((n) => ({ id: uid(), name: n, proficiency: "Fluent" as const }));
  return raw as CVLanguage[];
}

// Migrate old CVCustomSection format (title + content string)
function migrateCustom(raw: unknown): CVCustomSection[] {
  if (!Array.isArray(raw) || !raw.length) return [];
  return (raw as CVCustomSection[]).map((s) => {
    if (Array.isArray(s.entries)) return s; // already new format
    const old = s as unknown as { id: string; title: string; content: string };
    return {
      id: old.id ?? uid(),
      sectionTitle: old.title ?? "Custom Section",
      entries: old.content ? [{ id: uid(), description: old.content }] : [],
    };
  });
}

const newExp    = (): CVExperience    => ({ id: uid(), company: "", role: "", from: "", to: "", current: false, description: "", bullets: [""] });
const newEdu    = (): CVEducation     => ({ id: uid(), institution: "", degree: "", field: "", from: "", to: "", description: "" });
const newCert   = (): CVCertification => ({ id: uid(), name: "", issuer: "", date: "" });
const newLang   = (): CVLanguage      => ({ id: uid(), name: "", proficiency: "Fluent" });
const newProj   = (): CVProject       => ({ id: uid(), title: "", description: "", link: "", from: "", to: "" });
const newCourse = (): CVCourse        => ({ id: uid(), name: "", provider: "", date: "", link: "" });
const newAward  = (): CVAward         => ({ id: uid(), title: "", issuer: "", date: "", description: "" });
const newPub    = (): CVPublication   => ({ id: uid(), title: "", publisher: "", date: "", link: "", description: "" });
const newRef    = (): CVReference     => ({ id: uid(), name: "", jobTitle: "", company: "", email: "", phone: "" });
const newCustomSection = (): CVCustomSection => ({ id: uid(), sectionTitle: "Custom Section", entries: [] });
const newCustomEntry   = (): CVCustomEntry   => ({ id: uid(), title: "", subtitle: "", from: "", to: "", description: "" });

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground " +
  "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 " +
  "focus:border-primary/40 transition-colors";
const labelCls = "block text-[11px] font-medium text-muted-foreground mb-1";

// ─── Shared: fixed-position dropdown hook ────────────────────────────────────
// Uses createPortal + position:fixed so the dropdown escapes every overflow
// container and CSS transform ancestor in the layout.

type DropPos = { top: number; left: number; width: number; openUp: boolean };

function useFixedDropdown(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement>,
  estimatedHeight = 260
) {
  const [pos, setPos] = useState<DropPos>({ top: 0, left: 0, width: 0, openUp: false });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    function recalc() {
      if (!triggerRef.current) return;
      const r = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom - 8;
      const openUp = spaceBelow < estimatedHeight && r.top > estimatedHeight;
      setPos({
        top:    openUp ? r.top - estimatedHeight - 4 : r.bottom + 4,
        left:   r.left,
        width:  r.width,
        openUp,
      });
    }
    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize",  recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize",  recalc);
    };
  }, [open, triggerRef, estimatedHeight]);

  return pos;
}

// ─── Proficiency Select ───────────────────────────────────────────────────────

function ProficiencySelect({ value, onChange }: {
  value: CVLanguage["proficiency"];
  onChange: (v: CVLanguage["proficiency"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const pos = useFixedDropdown(open, triggerRef as React.RefObject<HTMLElement>, 200);

  useEffect(() => {
    if (!open) return;
    function down(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const dropdown = (
    <div
      ref={dropRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, width: Math.max(pos.width, 160), zIndex: 9999 }}
      className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
    >
      {PROFICIENCY_LEVELS.map((p) => (
        <button key={p} type="button" onClick={() => { onChange(p); setOpen(false); }}
          className={cn("w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-primary/10",
            value === p ? "bg-primary/15 text-primary font-semibold" : "text-foreground")}>
          {p}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(inputCls, "text-xs py-1.5 flex items-center justify-between text-left cursor-pointer")}
      >
        <span className="text-foreground">{value}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Month/Year Picker ────────────────────────────────────────────────────────

function MonthYearPicker({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen]         = useState(false);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear,  setSelYear]  = useState(new Date().getFullYear());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const pos = useFixedDropdown(open, triggerRef as React.RefObject<HTMLElement>);

  function parseValue() {
    const m = value?.match(/([A-Za-z]+)\s+(\d{4})/);
    if (m) {
      const idx = MONTHS.findIndex((mo) => mo.toLowerCase() === m[1].toLowerCase().slice(0, 3));
      return { month: idx + 1 || 1, year: parseInt(m[2]) };
    }
    return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  }

  function handleOpen() {
    const { month, year } = parseValue();
    setSelMonth(month);
    setSelYear(year);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function down(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const dropdown = (
    <div
      ref={dropRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="rounded-xl border border-border bg-card shadow-2xl p-3 w-52"
    >
      <div className="grid grid-cols-4 gap-1 mb-3">
        {MONTHS.map((m, i) => (
          <button key={m} type="button" onClick={() => setSelMonth(i + 1)}
            className={cn("rounded-lg py-1.5 text-xs font-medium transition-colors",
              selMonth === i + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>
            {m}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <button type="button" onClick={() => setSelYear((y) => y - 1)}
          className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors text-base leading-none">‹</button>
        <span className="flex-1 text-center text-sm font-semibold text-foreground">{selYear}</span>
        <button type="button" onClick={() => setSelYear((y) => y + 1)}
          className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors text-base leading-none">›</button>
      </div>
      <button type="button" onClick={() => { onChange(`${MONTHS[selMonth - 1]} ${selYear}`); setOpen(false); }}
        className="w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
        Select
      </button>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "e.g. Jan 2020"}
        className={cn(inputCls, "text-xs py-1.5")} />
      <button ref={triggerRef} type="button" onClick={handleOpen}
        className="shrink-0 rounded-lg border border-border/60 bg-muted/30 p-1.5 text-muted-foreground hover:text-foreground transition-colors">
        <CalendarDays className="h-3.5 w-3.5" />
      </button>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}

// ─── Year Picker ──────────────────────────────────────────────────────────────

function YearPicker({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropRef    = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 6 }, (_, i) => currentYear + 5 - i);
  const pos = useFixedDropdown(open, triggerRef as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (!open) return;
    function down(e: MouseEvent) {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (dropRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const dropdown = (
    <div
      ref={dropRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
      className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden w-32"
    >
      <div className="max-h-52 overflow-y-auto">
        {years.map((y) => (
          <button key={y} type="button"
            onClick={() => { onChange(String(y)); setOpen(false); }}
            className={cn("w-full px-3 py-2 text-sm text-left transition-colors hover:bg-muted/60",
              String(y) === value ? "bg-primary/10 text-primary font-semibold" : "text-foreground")}>
            {y}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-1.5">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Year"}
        className={cn(inputCls, "text-xs py-1.5")} />
      <button ref={triggerRef} type="button" onClick={() => setOpen((o) => !o)}
        className="shrink-0 rounded-lg border border-border/60 bg-muted/30 p-1.5 text-muted-foreground hover:text-foreground transition-colors">
        <CalendarDays className="h-3.5 w-3.5" />
      </button>
      {open && createPortal(dropdown, document.body)}
    </div>
  );
}

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
            placeholder="Achievement or responsibility…"
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
          className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-40 transition-colors">Add</button>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/50 px-2.5 py-0.5 text-xs text-foreground">
              {c}<button onClick={() => onChange(chips.filter((x) => x !== c))} className="text-muted-foreground/40 hover:text-rose-400 transition-colors"><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rich Text Area ───────────────────────────────────────────────────────────

function RichTextArea({ value, onChange, placeholder, minRows = 4 }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [empty, setEmpty] = useState(!value?.trim());

  // Sync external value into editor without cursor reset
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== (value ?? "")) {
      editorRef.current.innerHTML = value ?? "";
      setEmpty(!value?.trim());
    }
  }, [value]);

  function handleInput() {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
    setEmpty(!editorRef.current.textContent?.trim());
  }

  function execFmt(cmd: string) {
    editorRef.current?.focus();
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    document.execCommand(cmd, false, undefined);
    handleInput();
  }

  const tools = [
    { icon: Bold,         cmd: "bold",                 title: "Bold" },
    { icon: Italic,       cmd: "italic",               title: "Italic" },
    { icon: Underline,    cmd: "underline",             title: "Underline" },
    { icon: List,         cmd: "insertUnorderedList",   title: "Bullet list" },
    { icon: ListOrdered,  cmd: "insertOrderedList",     title: "Numbered list" },
  ];

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-colors overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/40 bg-muted/40">
        {tools.map(({ icon: Icon, cmd, title }, i) => (
          <>
            {i === 3 && <div key="sep" className="w-px h-3.5 bg-border/60 mx-1" />}
            <button key={cmd} type="button" title={title}
              onMouseDown={(e) => { e.preventDefault(); execFmt(cmd); }}
              className="rounded p-1.5 text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
              <Icon className="h-3.5 w-3.5" />
            </button>
          </>
        ))}
      </div>
      {/* Editable area */}
      <div className="relative">
        {empty && (
          <p className="absolute top-0 left-0 px-3 py-2 text-sm text-muted-foreground/40 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="px-3 py-2 text-sm text-foreground focus:outline-none [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:my-1 [&_li]:mb-0.5"
          style={{ minHeight: `${minRows * 1.6}rem` }}
        />
      </div>
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
              <input value={(contact as Record<string, string>)[key] ?? ""} onChange={(e) => onContactChange({ ...contact, [key]: e.target.value })}
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
                    {s==="sm"?"S":s==="md"?"M":"L"}
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

// ─── Section Row ──────────────────────────────────────────────────────────────

function SectionRow({ sectionId, isOpen, isHidden, onToggle, onToggleVisibility, onRemove, onDragStart, onDragOver, onDrop, onDragEnd, isDraggingOver, children }: {
  sectionId: string; isOpen: boolean; isHidden: boolean;
  onToggle: () => void; onToggleVisibility: () => void; onRemove: () => void;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void; onDragEnd: () => void; isDraggingOver: boolean; children: React.ReactNode;
}) {
  const def  = ALL_SECTIONS.find((s) => s.id === sectionId);
  const Icon = def?.icon ?? AlignLeft;
  return (
    <div onDragOver={onDragOver} onDrop={onDrop}
      className={cn("rounded-2xl border bg-card shadow-sm transition-all",
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

function AddContentModal({ addedSections, onAdd, onClose, onUploadResume }: {
  addedSections: string[]; onAdd: (id: string) => void; onClose: () => void;
  onUploadResume: (file: File) => Promise<void>;
}) {
  const available = ALL_SECTIONS.filter((s) => !addedSections.includes(s.id));
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded]   = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    try {
      await onUploadResume(file);
      setUploaded(true);
      setTimeout(() => setUploaded(false), 4000);
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : "Import failed — please try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {uploadErr && (
          <div className="mx-8 mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="font-bold shrink-0">⚠</span>
            <span>{uploadErr}</span>
            <button onClick={() => setUploadErr(null)} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-8 pt-8 pb-5">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Add content</h2>
            <p className="text-sm text-gray-500 mt-1">Quick start:</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Upload Resume — label wraps the input so the click always opens the picker */}
            <label className={cn(
              "flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors cursor-pointer select-none",
              uploading && "opacity-60 pointer-events-none"
            )}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                disabled={uploading}
                onChange={handleFile}
              />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploaded ? "Uploaded ✓" : uploading ? "Uploading…" : "Import Resume"}
            </label>
            <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-8 pb-8">
          {available.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {available.map((s) => {
                const Icon = s.icon;
                return (
                  <button key={s.id} onClick={() => { onAdd(s.id); onClose(); }}
                    className={cn("flex flex-col items-start gap-2 rounded-xl p-4 text-left hover:bg-gray-100 hover:shadow-sm transition-all",
                      s.dashed ? "border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400" : "border border-gray-200 bg-gray-50 hover:border-gray-300")}>
                    <Icon className="h-5 w-5 text-gray-600" />
                    <p className="font-bold text-gray-900 text-sm leading-tight">{s.label}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.description}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-gray-500">All available sections have been added.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AddContentButton({ addedSections, onAdd, onUploadResume }: {
  addedSections: string[];
  onAdd: (id: string) => void;
  onUploadResume: (file: File) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
        style={{ background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)" }}>
        <Plus className="h-4 w-4" /> Add Content
      </button>
      {open && (
        <AddContentModal
          addedSections={addedSections}
          onAdd={onAdd}
          onClose={() => setOpen(false)}
          onUploadResume={onUploadResume}
        />
      )}
    </>
  );
}

// ─── CV Preview ───────────────────────────────────────────────────────────────

// Render plain text or HTML content in the white CV preview
function HtmlOrText({ html, style }: { html: string; style: React.CSSProperties }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(html ?? "");
  if (isHtml) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{
          ...style,
          // Reset list styles for the white preview
        }}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="cv-rich-content"
      />
    );
  }
  return <p style={{ ...style, whiteSpace: "pre-line" }}>{html}</p>;
}

// A4 ratio: 297mm / 210mm ≈ 1.4143
const A4_RATIO = 297 / 210;

function CVPreview({ cv, name, addedSections, hiddenFromPreview }: {
  cv: CVProfile; name: string; addedSections: string[]; hiddenFromPreview: Set<string>;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pageBreaks, setPageBreaks] = useState<number[]>([]);
  const [pageCount, setPageCount]   = useState(1);
  const [pageH,     setPageH]       = useState(792); // A4 at 560px wide: 560 × 297/210 ≈ 792

  // Recalculate page breaks whenever content height changes
  useEffect(() => {
    const el = contentRef.current;
    const wr = wrapperRef.current;
    if (!el || !wr) return;
    function recalc() {
      if (!el || !wr) return;
      const rawWidth = wr.offsetWidth;
      if (rawWidth < 50) return; // layout not settled yet — skip
      const ph = Math.max(600, Math.round(rawWidth * A4_RATIO));
      setPageH(ph);
      const total = el.offsetHeight;
      const count = Math.max(1, Math.ceil(total / ph));
      setPageCount(count);
      setPageBreaks(
        Array.from({ length: count - 1 }, (_, i) => Math.round(ph * (i + 1)))
      );
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(wr); // watch wrapper width changes too
    return () => ro.disconnect();
  }, [cv, addedSections, hiddenFromPreview]);

  const style  = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };
  const accent = style.accentColor;
  const ff     = style.fontFamily;
  const basePx = FONT_SIZE_PX[style.fontSize ?? "md"];
  const gap    = SPACING_GAP[style.spacing ?? "normal"];
  const visible = addedSections.filter((id) => !hiddenFromPreview.has(id));
  const contact = cv.contact ?? {};

  const px = (n: number) => `${n}px`;
  const em = (n: number) => `${(n / basePx).toFixed(3)}em`;

  function SH({ title }: { title: string }) {
    return (
      <div style={{ marginBottom: px(gap * 0.6), paddingBottom: "4px", borderBottom: `1.5px solid #1a1a1a` }}>
        <p style={{ fontSize: em(basePx * 0.78), fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#1a1a1a", margin: 0 }}>
          {title}
        </p>
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
            <SH title="Professional Summary" />
            <HtmlOrText html={cv.summary} style={{ fontSize: em(basePx), lineHeight: 1.6, color: "#374151" }} />
          </div>
        );

      case "experience":
        if (!cv.experience?.length) return null;
        return (
          <div key="experience" style={{ marginBottom: px(gap) }}>
            <SH title="Professional Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.9) }}>
              {cv.experience.map((exp) => {
                const bullets = exp.bullets?.filter(Boolean) ?? [];
                const dateStr = exp.from ? `${exp.from} – ${exp.current ? "Present" : exp.to || ""}` : "";
                return (
                  <div key={exp.id}>
                    {/* Row 1: Job Title (bold) + Date (right) */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <p style={{ fontWeight: 700, fontSize: em(basePx), color: "#111827", margin: 0 }}>{exp.role || "Role"}</p>
                      {dateStr && <p style={{ fontSize: em(basePx * 0.85), color: "#6b7280", whiteSpace: "nowrap", margin: 0 }}>{dateStr}</p>}
                    </div>
                    {/* Row 2: Company (italic, accent) */}
                    {exp.company && (
                      <p style={{ fontSize: em(basePx * 0.92), color: accent, fontStyle: "italic", margin: "1px 0 4px" }}>{exp.company}</p>
                    )}
                    {/* Bullets */}
                    {bullets.length > 0 && (
                      <ul style={{ margin: "5px 0 0 14px", padding: 0 }}>
                        {bullets.map((b, i) => (
                          <li key={i} style={{ marginBottom: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.55 }}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {exp.description && <HtmlOrText html={exp.description} style={{ marginTop: "4px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
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
            <SH title="Education" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.education.map((e) => (
                <div key={e.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{ fontWeight: 700, fontSize: em(basePx), color: "#111827", margin: 0 }}>
                      {e.degree || "Degree"}{e.field ? ` in ${e.field}` : ""}
                    </p>
                    {(e.from || e.to) && (
                      <p style={{ fontSize: em(basePx * 0.85), color: "#6b7280", whiteSpace: "nowrap", margin: 0 }}>
                        {e.from}{e.to ? ` – ${e.to}` : ""}
                      </p>
                    )}
                  </div>
                  {e.institution && (
                    <p style={{ fontSize: em(basePx * 0.92), color: accent, fontStyle: "italic", margin: "1px 0 4px" }}>{e.institution}</p>
                  )}
                  {e.description && <HtmlOrText html={e.description} style={{ marginTop: "4px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (!cv.skills?.length) return null;
        return (
          <div key="skills" style={{ marginBottom: px(gap) }}>
            <SH title="Skills" />
            <p style={{ fontSize: em(basePx), color: "#374151", lineHeight: 1.7, margin: 0 }}>
              {cv.skills.join("  ·  ")}
            </p>
          </div>
        );

      case "languages":
        if (!cv.languages?.length) return null;
        return (
          <div key="languages" style={{ marginBottom: px(gap) }}>
            <SH title="Languages" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {(cv.languages as CVLanguage[]).map((l) => (
                <span key={l.id} style={{ fontSize: em(basePx), color: "#374151" }}>
                  <span style={{ fontWeight: 600, color: "#111827" }}>{l.name}</span>
                  {l.proficiency && <span style={{ color: "#9ca3af" }}> · {l.proficiency}</span>}
                </span>
              ))}
            </div>
          </div>
        );

      case "certifications":
        if (!cv.certifications?.length) return null;
        return (
          <div key="certifications" style={{ marginBottom: px(gap) }}>
            <SH title="Certificates" />
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
        return <div key="interests" style={{ marginBottom: px(gap) }}><SH title="Interests" /><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{cv.interests.map(chip)}</div></div>;

      case "projects":
        if (!cv.projects?.length) return null;
        return (
          <div key="projects" style={{ marginBottom: px(gap) }}>
            <SH title="Projects" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.7) }}>
              {cv.projects.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{p.title || "Project"}</p>
                    {(p.from || p.to) && <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap" }}>{p.from}{p.to ? ` – ${p.to}` : ""}</p>}
                  </div>
                  {p.description && <HtmlOrText html={p.description} style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
                  {p.link && <p style={{ marginTop: "2px", fontSize: em(basePx * 0.85), color: accent }}>{p.link}</p>}
                </div>
              ))}
            </div>
          </div>
        );

      case "courses":
        if (!cv.courses?.length) return null;
        return (
          <div key="courses" style={{ marginBottom: px(gap) }}>
            <SH title="Courses" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.4) }}>
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
            <SH title="Awards" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.awards.map((a) => (
                <div key={a.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{a.title || "Award"}</p>
                      {a.issuer && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{a.issuer}</p>}
                    </div>
                    {a.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{a.date}</span>}
                  </div>
                  {a.description && <HtmlOrText html={a.description} style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
                </div>
              ))}
            </div>
          </div>
        );

      case "publications":
        if (!cv.publications?.length) return null;
        return (
          <div key="publications" style={{ marginBottom: px(gap) }}>
            <SH title="Publications" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
              {cv.publications.map((p) => (
                <div key={p.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{p.title || "Publication"}</p>
                      {p.publisher && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{p.publisher}</p>}
                    </div>
                    {p.date && <span style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", flexShrink: 0 }}>{p.date}</span>}
                  </div>
                  {p.description && <HtmlOrText html={p.description} style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
                </div>
              ))}
            </div>
          </div>
        );

      case "references":
        if (!cv.references?.length) return null;
        return (
          <div key="references" style={{ marginBottom: px(gap) }}>
            <SH title="References" />
            <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.5) }}>
              {cv.references.map((r) => (
                <div key={r.id}>
                  <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{r.name || "Reference"}</p>
                  {(r.jobTitle || r.company) && <p style={{ fontSize: em(basePx * 0.9), color: "#6b7280" }}>{[r.jobTitle, r.company].filter(Boolean).join(", ")}</p>}
                  <div style={{ display: "flex", gap: "12px" }}>
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
        return <div key="declaration" style={{ marginBottom: px(gap) }}><SH title="Declaration" /><HtmlOrText html={cv.declaration ?? ""} style={{ fontSize: em(basePx), color: "#374151", lineHeight: 1.6 }} /></div>;

      case "custom":
        if (!cv.customSections?.length) return null;
        return (
          <div key="custom">
            {(cv.customSections as CVCustomSection[]).map((cs) => (
              <div key={cs.id} style={{ marginBottom: px(gap) }}>
                <SH title={cs.sectionTitle || "Custom Section"} />
                <div style={{ display: "flex", flexDirection: "column", gap: px(gap * 0.6) }}>
                  {(cs.entries ?? []).map((entry) => (
                    <div key={entry.id}>
                      {(entry.title || entry.from || entry.to) && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <div>
                            {entry.title && <p style={{ fontWeight: 600, fontSize: em(basePx), color: "#111827" }}>{entry.title}</p>}
                            {entry.subtitle && <p style={{ fontSize: em(basePx * 0.9), color: accent, fontWeight: 500 }}>{entry.subtitle}</p>}
                          </div>
                          {(entry.from || entry.to) && (
                            <p style={{ fontSize: em(basePx * 0.82), color: "#9ca3af", whiteSpace: "nowrap" }}>
                              {entry.from}{entry.to ? ` – ${entry.to}` : ""}
                            </p>
                          )}
                        </div>
                      )}
                      {entry.description && <HtmlOrText html={entry.description} style={{ marginTop: "3px", fontSize: em(basePx * 0.92), color: "#374151", lineHeight: 1.6 }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  };

  const hasContact = contact.email || contact.phone || contact.location || contact.website;

  // Outer print-preview shell (shown to user) + inner content (used for print)
  return (
    <div ref={wrapperRef}>
      {/* Page count badge */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "6px" }}>
        <span style={{ background: "rgba(0,0,0,0.18)", color: "#fff", fontSize: "11px", fontFamily: "Arial,sans-serif", padding: "2px 10px", borderRadius: "999px" }}>
          {pageCount} page{pageCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Relative wrapper so page-break overlays are positioned correctly */}
      <div style={{ position: "relative", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", borderRadius: "4px" }}>
        {/* The actual CV content */}
        <div
          ref={contentRef}
          id="cv-preview-panel"
          style={{ background: "#ffffff", fontFamily: ff, fontSize: px(basePx), color: "#1a1a1a", minHeight: `${pageH}px` }}
        >
          {/* ── FlowCV-style header ── */}
          <div style={{ padding: "32px 36px 20px", textAlign: "center", borderBottom: `2px solid ${accent}` }}>
            {/* Name */}
            <p style={{ fontSize: px(basePx * 2), fontWeight: 700, color: "#0f172a", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 4px" }}>
              {name || "Your Name"}
            </p>
            {/* Headline */}
            {cv.headline && (
              <p style={{ fontSize: px(basePx * 1.05), color: "#6b7280", fontStyle: "italic", fontWeight: 400, margin: "0 0 12px" }}>
                {cv.headline}
              </p>
            )}
            {/* Contact row — centered, separated by dots */}
            {hasContact && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "0", fontSize: px(basePx * 0.82), color: "#4b5563" }}>
                {[
                  contact.email    ? `✉ ${contact.email}`    : null,
                  contact.phone    ? `📞 ${contact.phone}`   : null,
                  contact.location ? `📍 ${contact.location}` : null,
                  contact.website  ? `🔗 ${contact.website}`  : null,
                ].filter(Boolean).map((item, i, arr) => (
                  <span key={i} style={{ display: "flex", alignItems: "center" }}>
                    <span>{item}</span>
                    {i < arr.length - 1 && <span style={{ margin: "0 8px", color: "#d1d5db" }}>·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Sections body ── */}
          <div style={{ padding: "20px 36px 32px" }}>
            {visible.map((id) => renderSection(id))}
          </div>
        </div>{/* end cv-preview-panel */}

        {/* Page break overlays */}
        {pageBreaks.map((y, i) => (
          <div key={i} style={{
            position: "absolute", top: y, left: 0, right: 0, height: "20px",
            background: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5,
          }}>
            <span style={{ color: "#94a3b8", fontSize: "10px", fontFamily: "Arial,sans-serif", letterSpacing: "0.5px" }}>
              — Page {i + 2} —
            </span>
          </div>
        ))}

        {/* Shadow under each page for depth */}
        {Array.from({ length: pageCount }).map((_, i) => {
          const wrapW = wrapperRef.current?.offsetWidth ?? 440;
          const pageH = (wrapW - 24) * A4_RATIO;
          return (
            <div key={i} style={{
              position: "absolute",
              top: i * (pageH + 20),
              left: 0, right: 0,
              height: pageH,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              zIndex: 4,
            }} />
          );
        })}
      </div>{/* end relative wrapper */}
    </div>
  );
}

// ─── Entry Card ───────────────────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function CVBuilder({ candidateId, candidateName, cvId, cvName: initialCvName, initialCv, onBack }: {
  candidateId: string; candidateName: string;
  cvId: string; cvName: string;
  initialCv: CVProfile | null;
  onBack: () => void;
}) {
  const [cv, setCv] = useState<CVProfile>(() => {
    if (!initialCv) return EMPTY_CV;
    return {
      ...initialCv,
      languages:      migrateLangs(initialCv.languages ?? []),
      customSections: migrateCustom(initialCv.customSections ?? []),
    };
  });
  const [cvNameState,       setCvNameState]      = useState(initialCvName);
  const [editingName,       setEditingName]      = useState(false);
  const [saving,            setSaving]           = useState(false);
  const [saved,             setSaved]            = useState(false);
  const [importMsg,         setImportMsg]        = useState<string | null>(null);
  const [addedSections,     setAddedSections]    = useState<string[]>(() => initialCv?.sectionOrder ?? []);
  const [hiddenFromPreview, setHiddenFromPreview]= useState<Set<string>>(new Set());
  const [openSection,       setOpenSection]      = useState<string | null>(null);
  const [dragItem,          setDragItem]         = useState<string | null>(null);
  const [dragOver,          setDragOver]         = useState<string | null>(null);

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

  async function uploadResume(file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`/api/candidates/${candidateId}/cv/import`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(err.error ?? "Import failed");
    }

    const data: { cvProfile: CVProfile; sections: string[] } = await res.json();

    // Populate the CV form with parsed data (keep existing style + sectionOrder)
    setCv((prev) => ({ ...prev, ...data.cvProfile, style: prev.style, sectionOrder: prev.sectionOrder }));

    // Auto-add any newly-parsed sections that aren't in the editor yet
    setAddedSections((prev) => {
      const toAdd = data.sections.filter(
        (s) => !prev.includes(s) && ALL_SECTIONS.some((def) => def.id === s)
      );
      return [...prev, ...toAdd];
    });

    const n = data.sections.length;
    setImportMsg(`Resume imported — ${n} section${n === 1 ? "" : "s"} detected`);
    setTimeout(() => setImportMsg(null), 5000);
  }

  async function save() {
    setSaving(true);
    await fetch(`/api/candidates/${candidateId}/cv`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cvId, name: cvNameState, ...cv, sectionOrder: addedSections }),
    });
    setCv((p) => ({ ...p, sectionOrder: addedSections }));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // Generic array CRUD factory
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

  const expH  = listHelpers<CVExperience>("experience");
  const eduH  = listHelpers<CVEducation>("education");
  const certH = listHelpers<CVCertification>("certifications");
  const langH = listHelpers<CVLanguage>("languages");
  const projH = listHelpers<CVProject>("projects");
  const crsH  = listHelpers<CVCourse>("courses");
  const awdH  = listHelpers<CVAward>("awards");
  const pubH  = listHelpers<CVPublication>("publications");
  const refH  = listHelpers<CVReference>("references");
  const custH = listHelpers<CVCustomSection>("customSections");

  // Custom section entry helpers
  function updateCustomEntry(sectionId: string, entryId: string, patch: Partial<CVCustomEntry>) {
    setCv((p) => ({
      ...p,
      customSections: (p.customSections ?? []).map((s) =>
        s.id === sectionId ? { ...s, entries: s.entries.map((e) => e.id === entryId ? { ...e, ...patch } : e) } : s
      ),
    }));
  }
  function removeCustomEntry(sectionId: string, entryId: string) {
    setCv((p) => ({
      ...p,
      customSections: (p.customSections ?? []).map((s) =>
        s.id === sectionId ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) } : s
      ),
    }));
  }
  function addCustomEntry(sectionId: string) {
    setCv((p) => ({
      ...p,
      customSections: (p.customSections ?? []).map((s) =>
        s.id === sectionId ? { ...s, entries: [...s.entries, newCustomEntry()] } : s
      ),
    }));
  }

  // ── Section editors ───────────────────────────────────────────────────────────

  function renderSectionEditor(id: string) {
    switch (id) {

      case "summary":
        return (
          <RichTextArea
            value={cv.summary}
            onChange={(v) => setCv((p) => ({ ...p, summary: v }))}
            placeholder="A concise paragraph describing your career, key strengths, and what you bring to the table…"
            minRows={4}
          />
        );

      case "experience":
        return (
          <div className="space-y-4">
            {cv.experience.map((e, i) => (
              <EntryCard key={e.id} label={`Position ${i + 1}`} onRemove={() => expH.remove(e.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Job Title</label><input value={e.role} onChange={(ev) => expH.update(e.id, { role: ev.target.value })} placeholder="e.g. Product Manager" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Company</label><input value={e.company} onChange={(ev) => expH.update(e.id, { company: ev.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>From</label><MonthYearPicker value={e.from} onChange={(v) => expH.update(e.id, { from: v })} /></div>
                  <div><label className={labelCls}>To</label>
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1"><MonthYearPicker value={e.current ? "" : e.to} onChange={(v) => expH.update(e.id, { to: v })} placeholder={e.current ? "Present" : "e.g. Dec 2023"} /></div>
                      <label className="flex items-center gap-1 text-[11px] text-muted-foreground cursor-pointer shrink-0"><input type="checkbox" checked={e.current} onChange={(ev) => expH.update(e.id, { current: ev.target.checked })} /> Now</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <RichTextArea
                    value={e.description}
                    onChange={(v) => expH.update(e.id, { description: v })}
                    placeholder="Describe your responsibilities, achievements, and impact…"
                    minRows={3}
                  />
                </div>
                <BulletListInput bullets={e.bullets ?? [""]} onChange={(b) => expH.update(e.id, { bullets: b })} />
              </EntryCard>
            ))}
            <button onClick={() => expH.add(newExp())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Position</button>
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            {cv.education.map((e, i) => (
              <EntryCard key={e.id} label={`Entry ${i + 1}`} onRemove={() => eduH.remove(e.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Institution</label><input value={e.institution} onChange={(ev) => eduH.update(e.id, { institution: ev.target.value })} placeholder="e.g. University of Manchester" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Degree</label><input value={e.degree} onChange={(ev) => eduH.update(e.id, { degree: ev.target.value })} placeholder="e.g. BSc, MBA" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Field of Study</label><input value={e.field} onChange={(ev) => eduH.update(e.id, { field: ev.target.value })} placeholder="e.g. Computer Science" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><label className={labelCls}>From</label><YearPicker value={e.from} onChange={(v) => eduH.update(e.id, { from: v })} /></div>
                    <div><label className={labelCls}>To</label><YearPicker value={e.to} onChange={(v) => eduH.update(e.id, { to: v })} /></div>
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Description (optional)</label>
                    <RichTextArea value={e.description ?? ""} onChange={(v) => eduH.update(e.id, { description: v })} placeholder="Relevant modules, honours, exchange terms…" minRows={2} />
                  </div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => eduH.add(newEdu())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Education</button>
          </div>
        );

      case "skills":
        return <ChipInput chips={cv.skills} placeholder="Type a skill and press Enter…" onChange={(c) => setCv((p) => ({ ...p, skills: c }))} />;

      case "languages":
        return (
          <div className="space-y-3">
            {(cv.languages as CVLanguage[] ?? []).map((l, i) => (
              <EntryCard key={l.id} label={`Language ${i + 1}`} onRemove={() => langH.remove(l.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Language</label>
                    <input value={l.name} onChange={(e) => langH.update(l.id, { name: e.target.value })} placeholder="e.g. English" className={cn(inputCls, "text-xs py-1.5")} />
                  </div>
                  <div>
                    <label className={labelCls}>Proficiency</label>
                    <ProficiencySelect
                      value={l.proficiency}
                      onChange={(v) => langH.update(l.id, { proficiency: v })}
                    />
                  </div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => langH.add(newLang())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Language</button>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-3">
            {(cv.certifications ?? []).map((c, i) => (
              <EntryCard key={c.id} label={`Cert ${i + 1}`} onRemove={() => certH.remove(c.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Certification Name</label><input value={c.name} onChange={(e) => certH.update(c.id, { name: e.target.value })} placeholder="e.g. AWS Solutions Architect" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Issuer</label><input value={c.issuer} onChange={(e) => certH.update(c.id, { issuer: e.target.value })} placeholder="e.g. Amazon Web Services" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><MonthYearPicker value={c.date} onChange={(v) => certH.update(c.id, { date: v })} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => certH.add(newCert())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Certification</button>
          </div>
        );

      case "interests":
        return <ChipInput chips={cv.interests ?? []} placeholder="e.g. Photography, Hiking…" onChange={(c) => setCv((p) => ({ ...p, interests: c }))} />;

      case "projects":
        return (
          <div className="space-y-4">
            {(cv.projects ?? []).map((p, i) => (
              <EntryCard key={p.id} label={`Project ${i + 1}`} onRemove={() => projH.remove(p.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Project Title</label><input value={p.title} onChange={(e) => projH.update(p.id, { title: e.target.value })} placeholder="e.g. E-commerce Platform" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>From</label><MonthYearPicker value={p.from ?? ""} onChange={(v) => projH.update(p.id, { from: v })} /></div>
                  <div><label className={labelCls}>To</label><MonthYearPicker value={p.to ?? ""} onChange={(v) => projH.update(p.id, { to: v })} /></div>
                  <div className="col-span-2"><label className={labelCls}>Link</label><input value={p.link ?? ""} onChange={(e) => projH.update(p.id, { link: e.target.value })} placeholder="https://github.com/…" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><RichTextArea value={p.description} onChange={(v) => projH.update(p.id, { description: v })} placeholder="Your role and impact…" minRows={2} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => projH.add(newProj())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Project</button>
          </div>
        );

      case "courses":
        return (
          <div className="space-y-3">
            {(cv.courses ?? []).map((c, i) => (
              <EntryCard key={c.id} label={`Course ${i + 1}`} onRemove={() => crsH.remove(c.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Course Name</label><input value={c.name} onChange={(e) => crsH.update(c.id, { name: e.target.value })} placeholder="e.g. Machine Learning Specialization" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Provider</label><input value={c.provider} onChange={(e) => crsH.update(c.id, { provider: e.target.value })} placeholder="e.g. Coursera" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><MonthYearPicker value={c.date ?? ""} onChange={(v) => crsH.update(c.id, { date: v })} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => crsH.add(newCourse())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Course</button>
          </div>
        );

      case "awards":
        return (
          <div className="space-y-3">
            {(cv.awards ?? []).map((a, i) => (
              <EntryCard key={a.id} label={`Award ${i + 1}`} onRemove={() => awdH.remove(a.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Award Title</label><input value={a.title} onChange={(e) => awdH.update(a.id, { title: e.target.value })} placeholder="e.g. Employee of the Year" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Issuer</label><input value={a.issuer} onChange={(e) => awdH.update(a.id, { issuer: e.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><MonthYearPicker value={a.date ?? ""} onChange={(v) => awdH.update(a.id, { date: v })} /></div>
                  <div className="col-span-2"><label className={labelCls}>Description</label><RichTextArea value={a.description ?? ""} onChange={(v) => awdH.update(a.id, { description: v })} placeholder="Brief description…" minRows={2} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => awdH.add(newAward())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Award</button>
          </div>
        );

      case "publications":
        return (
          <div className="space-y-3">
            {(cv.publications ?? []).map((p, i) => (
              <EntryCard key={p.id} label={`Publication ${i + 1}`} onRemove={() => pubH.remove(p.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2"><label className={labelCls}>Title</label><input value={p.title} onChange={(e) => pubH.update(p.id, { title: e.target.value })} placeholder="e.g. The Future of AI in Healthcare" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Publisher / Journal</label><input value={p.publisher} onChange={(e) => pubH.update(p.id, { publisher: e.target.value })} placeholder="e.g. Nature" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Date</label><MonthYearPicker value={p.date ?? ""} onChange={(v) => pubH.update(p.id, { date: v })} /></div>
                  <div className="col-span-2"><label className={labelCls}>Link</label><input value={p.link ?? ""} onChange={(e) => pubH.update(p.id, { link: e.target.value })} placeholder="https://…" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => pubH.add(newPub())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Publication</button>
          </div>
        );

      case "references":
        return (
          <div className="space-y-3">
            {(cv.references ?? []).map((r, i) => (
              <EntryCard key={r.id} label={`Reference ${i + 1}`} onRemove={() => refH.remove(r.id)}>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={labelCls}>Full Name</label><input value={r.name} onChange={(e) => refH.update(r.id, { name: e.target.value })} placeholder="e.g. Jane Smith" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Job Title</label><input value={r.jobTitle ?? ""} onChange={(e) => refH.update(r.id, { jobTitle: e.target.value })} placeholder="e.g. Head of Engineering" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Company</label><input value={r.company ?? ""} onChange={(e) => refH.update(r.id, { company: e.target.value })} placeholder="e.g. Acme Corp" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Email</label><input value={r.email ?? ""} onChange={(e) => refH.update(r.id, { email: e.target.value })} placeholder="jane@acme.com" className={cn(inputCls, "text-xs py-1.5")} /></div>
                  <div><label className={labelCls}>Phone</label><input value={r.phone ?? ""} onChange={(e) => refH.update(r.id, { phone: e.target.value })} placeholder="+44 7700 900000" className={cn(inputCls, "text-xs py-1.5")} /></div>
                </div>
              </EntryCard>
            ))}
            <button onClick={() => refH.add(newRef())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Reference</button>
          </div>
        );

      case "declaration":
        return (
          <RichTextArea
            value={cv.declaration ?? ""}
            onChange={(v) => setCv((p) => ({ ...p, declaration: v }))}
            placeholder="I hereby declare that the information provided is true and accurate to the best of my knowledge…"
            minRows={4}
          />
        );

      case "custom":
        return (
          <div className="space-y-5">
            {(cv.customSections ?? []).map((cs, si) => (
              <div key={cs.id} className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">Custom Block {si + 1}</p>
                  <button onClick={() => custH.remove(cs.id)} className="text-muted-foreground/30 hover:text-rose-400 transition-colors"><X className="h-3.5 w-3.5" /></button>
                </div>
                {/* Section title */}
                <div>
                  <label className={labelCls}>Section Heading</label>
                  <input value={cs.sectionTitle} onChange={(e) => custH.update(cs.id, { sectionTitle: e.target.value })} placeholder="e.g. Volunteering, Hobbies…" className={cn(inputCls, "text-xs py-1.5")} />
                </div>
                {/* Entries */}
                {cs.entries.map((entry, ei) => (
                  <div key={entry.id} className="rounded-lg border border-border/40 bg-background/40 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground">Entry {ei + 1}</p>
                      <button onClick={() => removeCustomEntry(cs.id, entry.id)} className="text-muted-foreground/30 hover:text-rose-400 transition-colors"><X className="h-3 w-3" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelCls}>Title</label><input value={entry.title ?? ""} onChange={(e) => updateCustomEntry(cs.id, entry.id, { title: e.target.value })} placeholder="e.g. Role or Topic" className={cn(inputCls, "text-xs py-1.5")} /></div>
                      <div><label className={labelCls}>Subtitle</label><input value={entry.subtitle ?? ""} onChange={(e) => updateCustomEntry(cs.id, entry.id, { subtitle: e.target.value })} placeholder="e.g. Organisation" className={cn(inputCls, "text-xs py-1.5")} /></div>
                      <div><label className={labelCls}>From</label><MonthYearPicker value={entry.from ?? ""} onChange={(v) => updateCustomEntry(cs.id, entry.id, { from: v })} /></div>
                      <div><label className={labelCls}>To</label><MonthYearPicker value={entry.to ?? ""} onChange={(v) => updateCustomEntry(cs.id, entry.id, { to: v })} /></div>
                      <div className="col-span-2"><label className={labelCls}>Description</label><RichTextArea value={entry.description ?? ""} onChange={(v) => updateCustomEntry(cs.id, entry.id, { description: v })} placeholder="Details…" minRows={2} /></div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addCustomEntry(cs.id)} className="flex items-center gap-1.5 text-xs font-medium text-primary/70 hover:text-primary transition-colors">
                  <Plus className="h-3.5 w-3.5" /> Add Entry
                </button>
              </div>
            ))}
            <button onClick={() => custH.add(newCustomSection())} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 transition-opacity"><Plus className="h-3.5 w-3.5" /> Add Custom Block</button>
          </div>
        );

      default: return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const currentStyle = { ...DEFAULT_STYLE, ...(cv.style ?? {}) };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 140px)", minHeight: "600px" }}>

      {/* ── FlowCV-style top bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-3 shrink-0">
        <div className="flex items-center gap-3">
          {/* Back to CV list */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5 rotate-90" /> My CVs
          </button>
          <div className="h-4 w-px bg-border" />
          {/* Editable CV name */}
          {editingName ? (
            <input
              autoFocus
              value={cvNameState}
              onChange={(e) => setCvNameState(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setEditingName(false); }}
              className="rounded-md border border-primary/40 bg-background px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 w-40"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              title="Click to rename"
            >
              {cvNameState}
            </button>
          )}
          {importMsg && (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
              ✓ {importMsg}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Print / PDF</span>
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Two-panel body ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT — editor (fixed width, independently scrollable) */}
        <div className="w-[340px] min-w-[280px] shrink-0 overflow-y-auto border-r border-border bg-sidebar/30 p-4 space-y-3">
          <PersonalInfoCard
            name={candidateName}
            headline={cv.headline}
            contact={cv.contact ?? {}}
            accentColor={currentStyle.accentColor}
            onHeadlineChange={(v) => setCv((p) => ({ ...p, headline: v }))}
            onContactChange={setContact}
          />
          <AppearancePanel currentStyle={currentStyle} onStyleChange={setStyle} />

          {addedSections.map((id) => (
            <SectionRow
              key={id}
              sectionId={id}
              isOpen={openSection === id}
              isHidden={hiddenFromPreview.has(id)}
              onToggle={() => setOpenSection(openSection === id ? null : id)}
              onToggleVisibility={() => toggleHidden(id)}
              onRemove={() => removeSection(id)}
              onDragStart={() => setDragItem(id)}
              onDragOver={(e) => handleDragOver(e, id)}
              onDrop={() => handleDrop(id)}
              onDragEnd={() => { setDragItem(null); setDragOver(null); }}
              isDraggingOver={dragOver === id}
            >
              {renderSectionEditor(id)}
            </SectionRow>
          ))}

          <AddContentButton addedSections={addedSections} onAdd={addSection} onUploadResume={uploadResume} />

          {/* Bottom padding so last element doesn't touch the edge */}
          <div className="h-4" />
        </div>

        {/* RIGHT — document viewer (fills remaining space, light bg, centered preview) */}
        <div className="flex-1 overflow-y-auto bg-[#e8edf2]">
          {/* Download bar */}
          <div className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-black/10 bg-[#dde3eb] px-5 py-2">
            <span className="text-[11px] text-slate-500">Live Preview</span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-white border border-black/10 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="h-3 w-3" /> Save as PDF
            </button>
          </div>

          {/* Centered A4 preview */}
          <div className="flex justify-center py-8 px-4">
            <div className="w-full max-w-[560px]">
              <CVPreview
                cv={cv}
                name={candidateName}
                addedSections={addedSections}
                hiddenFromPreview={hiddenFromPreview}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
