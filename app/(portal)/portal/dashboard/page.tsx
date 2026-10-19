"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Compass, Briefcase, GraduationCap, UserCircle,
  FileText, Network, BookOpen, MessageSquare, CheckCircle2,
  Target, Lightbulb, Sunset, Heart, ChevronRight, ChevronDown,
  Bell, LogOut, Zap, Plus, Headphones, ExternalLink, Search,
  List, Sparkles, MapPin, Building2, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sidebar nav config ────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  Icon: React.ElementType;
  children?: { id: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",         label: "Dashboard",           Icon: LayoutDashboard },
  { id: "orientation",       label: "Orientation",         Icon: Compass },
  {
    id: "jobs",              label: "Jobs",                Icon: Briefcase,
    children: [
      { id: "jobs-search",  label: "Search Jobs" },
      { id: "jobs-target",  label: "Target Jobs" },
      { id: "jobs-boards",  label: "Job Boards" },
    ],
  },
  { id: "skills",            label: "Skills & Assessments", Icon: GraduationCap },
  { id: "personal-brand",   label: "Personal Brand",       Icon: UserCircle },
  { id: "cv",               label: "CV Development",       Icon: FileText },
  {
    id: "networking",        label: "Networking",           Icon: Network,
    children: [
      { id: "networking-online",   label: "Online Networking" },
      { id: "networking-inperson", label: "In-Person" },
      { id: "networking-strategy", label: "Strategy" },
    ],
  },
  { id: "research",          label: "Research & Learning",  Icon: BookOpen },
  { id: "interview",         label: "Interview",            Icon: MessageSquare },
  { id: "onboarding",       label: "Onboarding Success",   Icon: CheckCircle2 },
  { id: "career-mgmt",      label: "Career Management",    Icon: Target },
  { id: "entrepreneurship", label: "Entrepreneurship",     Icon: Lightbulb },
  { id: "retirement",       label: "Retirement",           Icon: Sunset },
  { id: "wellness",         label: "Wellness",             Icon: Heart },
];

// ─── Sidebar ───────────────────────────────────────────────────────────────────

function CandidateSidebar({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-foreground">Elevate Vue</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Career Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Menu Options &middot; {NAV_ITEMS.length}
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id || (item.children?.some((c) => c.id === activeId));
            const isOpen = expanded[item.id];
            const hasChildren = !!item.children?.length;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (hasChildren) toggle(item.id);
                    else onSelect(item.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive && !hasChildren
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    isActive && !hasChildren ? "border-primary" : "border-muted-foreground/30"
                  )}>
                    {isActive && !hasChildren && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <item.Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left text-[13px]">{item.label}</span>
                  {hasChildren && (
                    isOpen
                      ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {/* Sub-items */}
                {hasChildren && isOpen && (
                  <ul className="mt-0.5 ml-10 space-y-0.5">
                    {item.children!.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => onSelect(child.id)}
                          className={cn(
                            "w-full rounded-lg px-3 py-1.5 text-left text-[12px] transition-all",
                            activeId === child.id
                              ? "text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

// ─── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="96" height="96" className="rotate-[-90deg]">
      <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
      <circle
        cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="text-primary transition-all duration-700"
      />
    </svg>
  );
}

// ─── Placeholder data ──────────────────────────────────────────────────────────

const PLACEHOLDER_JOBS = [
  { id: "1", title: "Senior Marketing Manager",     company: "Accenture",        location: "Dubai, UAE" },
  { id: "2", title: "Head of Business Development", company: "KPMG Middle East", location: "Abu Dhabi, UAE" },
  { id: "3", title: "Strategy Consultant",           company: "McKinsey & Co.",  location: "Riyadh, KSA" },
];

const PLACEHOLDER_INSIGHTS = [
  { id: "1", title: "Read the Market, Shape Your Strategy",   author: "Emma Collins",  date: "15 Oct 2026" },
  { id: "2", "title": "\"Killer Skills\" That Drain Your Career", author: "James Wright", date: "08 Oct 2026" },
  { id: "3", title: "Transferable Skills You May Be Overlooking", author: "Sara Ahmed",  date: "01 Oct 2026" },
];

// ─── Main Dashboard Page ───────────────────────────────────────────────────────

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [candidateName, setCandidateName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.name) setCandidateName(session.user.name);
  }, [session]);

  if (status === "loading" || !session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const firstName = candidateName.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const motivational = "Your next opportunity is closer than you think. Let's make today count.";

  return (
    <div className="fixed inset-0 z-30 flex bg-background overflow-hidden">

      {/* ── Sidebar ── */}
      <CandidateSidebar activeId={activeNav} onSelect={setActiveNav} />

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/80 backdrop-blur px-6">
          <div />
          <div className="flex items-center gap-3">
            <button className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-sidebar-accent">
              Help Centre
            </button>
            <button className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-sidebar-accent">
              Got Hired? 🎉
            </button>
            <button className="rounded-lg px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-sidebar-accent">
              Got Feedback?
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                {firstName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{firstName}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Page heading */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">{greeting} {firstName}!</p>
              <p className="text-sm text-muted-foreground/70">{motivational}</p>
            </div>

            {/* ── Row 1: 3 hero cards ── */}
            <div className="grid grid-cols-3 gap-4">

              {/* Action Plan */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">Action Plan</h3>
                  <Calendar className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground -mt-2">You&apos;re on Day One.</p>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <ProgressRing pct={1} />
                    <span className="absolute text-sm font-bold text-foreground">1%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Not sure where to start?</p>
                    <p className="text-xs text-primary font-medium mt-0.5 cursor-pointer hover:underline">Click here</p>
                    <p className="text-xs text-muted-foreground">and get started on the plan we created for you!</p>
                  </div>
                </div>
                <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  View Your Weekly Actions
                </button>
              </div>

              {/* Target Jobs */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">Target Jobs</h3>
                  <Briefcase className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  With My Jobs you can easily track your job search progress. Get started by saving a few target jobs now.
                </p>
                <div className="mt-auto space-y-2">
                  <button className="w-full rounded-xl border border-primary/30 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" /> Search Job Postings
                  </button>
                  <button className="w-full rounded-xl border border-border py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-center gap-2">
                    <List className="h-4 w-4" /> Job Boards List
                  </button>
                </div>
              </div>

              {/* Meet Vera */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground">Meet Vera</h3>
                  <Sparkles className="h-5 w-5 text-primary/60" />
                </div>
                <p className="text-sm font-medium text-foreground -mt-2">Meet Vera, Your AI-Based Assistant</p>
                <p className="text-sm text-muted-foreground">
                  Getting started can be hard but that&apos;s where Vera comes in. Ask Vera for career advice, CV feedback, interview prep, and more.
                </p>
                <button className="mt-auto w-full rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                  Learn About Vera
                </button>
              </div>
            </div>

            {/* ── Row 2: Job Tools + Coach Insights ── */}
            <div className="grid grid-cols-2 gap-4">

              {/* Job Search Tools */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-semibold text-foreground">Job Search Tools</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Search for posted job opportunities or use our catalog of job boards to expand your search.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {PLACEHOLDER_JOBS.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {job.company[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{job.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3" /> {job.company}
                          <span className="mx-1">·</span>
                          <MapPin className="h-3 w-3" /> {job.location}
                        </p>
                      </div>
                      <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Insights */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-semibold text-foreground">Most Recent Coach Insights</h3>
                </div>
                <div className="divide-y divide-border">
                  {PLACEHOLDER_INSIGHTS.map((article) => (
                    <div key={article.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 overflow-hidden">
                        <BookOpen className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{article.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{article.author} · {article.date}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                          <ExternalLink className="h-3 w-3" /> Read
                        </button>
                        <button className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                          <Headphones className="h-3 w-3" /> Listen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>

          {/* ── Right panel: Reminders ── */}
          <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-card/50 p-5 space-y-5">
            <div>
              <h3 className="font-semibold text-foreground">Reminders</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Job search can be a stressful experience. Let us help you get started on planning your day to day.
              </p>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-sidebar-accent transition-colors">
              <Plus className="h-4 w-4" /> New Reminder
            </button>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No reminders yet</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">Add one to stay on track</p>
            </div>

            {/* Quick links */}
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quick Links</p>
              {[
                { label: "See All Reminders", Icon: Bell },
                { label: "View Action Plan",  Icon: Target },
                { label: "My Sessions",       Icon: Calendar },
              ].map(({ label, Icon }) => (
                <button key={label} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
