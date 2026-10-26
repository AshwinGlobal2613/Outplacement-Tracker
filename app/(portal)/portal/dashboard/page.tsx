"use client";

import { useState, useEffect } from "react";
import { OnboardingWizard } from "@/components/portal/onboarding-wizard";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Compass, Briefcase, GraduationCap, UserCircle,
  FileText, Network, BookOpen, MessageSquare, CheckCircle2,
  Target, Lightbulb, Sunset, Heart, ChevronRight, ChevronDown,
  Bell, LogOut, Plus, ExternalLink, Search, List, Sparkles,
  MapPin, Building2, Calendar, Volume2, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  Icon: React.ElementType;
  children?: { id: string; label: string }[];
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",         label: "Dashboard",            Icon: LayoutDashboard },
  { id: "orientation",       label: "Orientation",          Icon: Compass,
    children: [
      { id: "orientation-welcome",  label: "Welcome Message" },
      { id: "orientation-action",   label: "Action Plan" },
      { id: "orientation-vera",     label: "Meet Vera" },
      { id: "orientation-resource", label: "Resource Centre" },
    ] },
  { id: "jobs",              label: "Jobs",                 Icon: Briefcase,
    children: [
      { id: "jobs-search",  label: "Search Jobs" },
      { id: "jobs-target",  label: "Target Jobs" },
      { id: "jobs-boards",  label: "Job Boards" },
    ] },
  { id: "skills",            label: "Skills & Assessments", Icon: GraduationCap,
    children: [{ id: "skills-assessments", label: "My Assessments" }] },
  { id: "personal-brand",   label: "Personal Brand",        Icon: UserCircle,
    children: [{ id: "brand-linkedin", label: "LinkedIn Profile" }] },
  { id: "cv",               label: "CV",                    Icon: FileText,
    children: [{ id: "cv-builder", label: "CV Builder" }] },
  { id: "networking",        label: "Networking",            Icon: Network,
    children: [
      { id: "networking-online",   label: "Online" },
      { id: "networking-inperson", label: "In-Person" },
    ] },
  { id: "research",          label: "Research & Learning",   Icon: BookOpen,
    children: [{ id: "research-articles", label: "Articles" }] },
  { id: "interview",         label: "Interview",             Icon: MessageSquare,
    children: [{ id: "interview-prep", label: "Preparation" }] },
  { id: "onboarding",       label: "Onboarding Success",    Icon: CheckCircle2,
    children: [{ id: "onboarding-checklist", label: "Checklist" }] },
  { id: "career-mgmt",      label: "Career Management",     Icon: Target,
    children: [{ id: "career-plan", label: "Career Plan" }] },
  { id: "entrepreneurship", label: "Entrepreneurship",      Icon: Lightbulb,
    children: [{ id: "entre-resources", label: "Resources" }] },
  { id: "retirement",       label: "Retirement",            Icon: Sunset,
    children: [{ id: "retire-planning", label: "Planning" }] },
  { id: "wellness",         label: "Wellness",              Icon: Heart,
    children: [{ id: "wellness-tips", label: "Tips & Tools" }] },
];

const AVATAR_COLORS = [
  "bg-rose-500", "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-cyan-500", "bg-fuchsia-500", "bg-indigo-500",
];

function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const PLACEHOLDER_JOBS = [
  { id: "1", title: "Senior Marketing Manager",       company: "Accenture",           location: "Dubai, UAE" },
  { id: "2", title: "Head of Business Development",   company: "KPMG Middle East",    location: "Abu Dhabi, UAE" },
  { id: "3", title: "Strategy Consultant",             company: "McKinsey & Company", location: "Riyadh, KSA" },
];

const PLACEHOLDER_INSIGHTS = [
  { id: "1", title: "Read the Market, Shape Your Strategy",       author: "Emma Collins", date: "15 Oct 2026" },
  { id: "2", title: '"Killer Skills" That Can Drain Your Career', author: "James Wright", date: "08 Oct 2026" },
  { id: "3", title: "Transferable Skills You May Be Overlooking", author: "Sara Ahmed",   date: "01 Oct 2026" },
];

function WelcomeMessage({ fullName, goal, bio, jobTitle, location }: { fullName: string; goal: string; bio?: string; jobTitle?: string; location?: string }) {
  return (
    <div className="flex gap-5 items-start py-2">

      {/* Left column: Section 1 + Section 1.1 */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Section 1 — hero greeting */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-8 py-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">Welcome</p>
          <h1 className="text-2xl font-bold text-foreground leading-snug">
            Hello {fullName},
          </h1>
          <h2 className="text-xl font-semibold text-primary mt-1">Welcome to Altius</h2>
        </div>

        {/* Section 1.1 — programme overview */}
        <div className="rounded-2xl border border-border bg-card px-8 py-7 space-y-4">
          <p className="text-[15px] text-foreground leading-relaxed">
            Your Altius career transition programme includes access to our career management platform
            with resources on CV development, developing your personal brand, interview preparation,
            networking and more. We know career transitions can be stressful and knowing where you are
            heading tricky.
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            Successful career transitions are more than just crafting a great CV and applying for jobs;
            it&apos;s acknowledging how a transition impacts other aspects of a person&apos;s life and
            well-being. For this reason, we&apos;ve included wellness resources to support you on your
            journey and to a range of tools and resources at your fingertips.
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            <span className="font-semibold text-primary">Altius</span> is your personal career
            management tool designed to help you achieve your next move, whatever the situation.
          </p>
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
            <p className="text-[14px] text-foreground leading-relaxed">
              Based on what you have shared with us during onboarding, you are interested in{" "}
              <span className="font-semibold text-primary">{goal}</span>. We want to help you do that.
            </p>
          </div>
        </div>
      </div>

      {/* Right column: Section 2 + info cards */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Section 2 — goals text (restored) */}
        <div className="rounded-2xl border border-border bg-card px-8 py-7 space-y-4">
          <h3 className="text-base font-semibold text-foreground">
            Here are the other insights you shared with us about your goals and motivations:
          </h3>
          <div className="rounded-xl border border-border bg-sidebar-accent/40 px-5 py-4 space-y-3">
            <p className="text-[14px] text-foreground leading-relaxed">
              You indicated you are interested in{" "}
              <span className="font-semibold text-primary">{goal}</span>
              {jobTitle ? (
                <>, with a focus on{" "}<span className="font-semibold text-primary">{jobTitle}</span></>
              ) : null}
              . We are confident you can achieve this goal, and we&apos;re here to support you.
            </p>
            {bio && (
              <p className="text-[13px] text-muted-foreground leading-relaxed italic border-t border-border/60 pt-3">
                &ldquo;{bio}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Info cards — Transition Goal, Location, Timeline, Goals & Motivations */}
        <div className="rounded-2xl border border-border bg-card px-8 py-7">
          <div className="grid grid-cols-2 grid-rows-2 gap-3">

            {/* Transition Goal */}
            <div className="rounded-xl border border-border bg-sidebar-accent/30 px-4 py-4 flex h-full items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Transition Goal:</p>
                <p className="text-sm text-foreground font-medium capitalize leading-snug">
                  {goal || "Not set"}
                </p>
                <button className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors text-left">
                  Update Your Transition Goal
                </button>
              </div>
              <Briefcase className="h-7 w-7 shrink-0 text-primary/50 mt-0.5" />
            </div>

            {/* Location */}
            <div className="rounded-xl border border-border bg-sidebar-accent/30 px-4 py-4 flex h-full items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Location:</p>
                {location ? (
                  <p className="text-sm text-foreground font-medium leading-snug">{location}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Not specified</p>
                )}
                <button className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors text-left">
                  Update Your Desired Location
                </button>
              </div>
              <MapPin className="h-7 w-7 shrink-0 text-primary/50 mt-0.5" />
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-border bg-sidebar-accent/30 px-4 py-4 flex h-full items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Timeline:</p>
                <p className="text-sm text-foreground font-medium leading-snug">No set timeline</p>
                <button className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors text-left">
                  Update Your Desired Timeline
                </button>
              </div>
              <Calendar className="h-7 w-7 shrink-0 text-primary/50 mt-0.5" />
            </div>

            {/* Goals and Motivations */}
            <div className="rounded-xl border border-border bg-sidebar-accent/30 px-4 py-4 flex h-full items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Goals and Motivations:</p>
                {bio ? (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{bio}</p>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Not provided</p>
                )}
                <button className="text-xs text-primary underline underline-offset-2 hover:text-primary/80 transition-colors text-left">
                  View Your Goals
                </button>
              </div>
              <UserCircle className="h-7 w-7 shrink-0 text-primary/50 mt-0.5" />
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="88" height="88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-border" />
      <circle
        cx="44" cy="44" r={r} fill="none" stroke="currentColor" strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        className="text-primary transition-all duration-700"
      />
    </svg>
  );
}

function Sidebar({ activeId, onSelect, goalLabel }: { activeId: string; onSelect: (id: string) => void; goalLabel: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
      {/* Goal card */}
      <div className="mx-3 mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-primary/70 mb-1">Your Goal</p>
        <p className="text-xs font-semibold text-foreground leading-snug capitalize">{goalLabel}</p>
        <button className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
          View Action Plan <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 mt-1">
        <ul className="space-y-px">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id || item.children?.some((c) => c.id === activeId);
            const isOpen = expanded[item.id];
            const hasChildren = !!item.children?.length;

            return (
              <li key={item.id}>
                <button
                  onClick={() => { hasChildren ? toggle(item.id) : onSelect(item.id); }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium transition-all",
                    isActive && !hasChildren
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  )}
                >
                  <item.Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {hasChildren && (
                    isOpen
                      ? <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
                      : <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                  )}
                </button>

                {hasChildren && isOpen && (
                  <ul className="ml-7 mt-0.5 space-y-px">
                    {item.children!.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => onSelect(child.id)}
                          className={cn(
                            "w-full rounded-lg px-2.5 py-1.5 text-left text-[11.5px] transition-all",
                            activeId === child.id
                              ? "text-primary font-semibold"
                              : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
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

      {/* Sign out */}
      <div className="border-t border-border p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function CandidateDashboard() {
  const { data: session } = useSession();
  const [activeNav, setActiveNav] = useState("dashboard");

  const fullName = session?.user?.name || "there";
  const firstName = fullName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const quote = "A robust professional network can open doors to mentorship, collaboration, and new career opportunities.";

  const GOAL_LABELS: Record<string, string> = {
    "new-role":      "finding a new role",
    "career-change": "changing careers",
    "own-business":  "working for yourself",
    "retirement":    "transitioning to retirement",
  };

  const [onboardingData, setOnboardingData] = useState<{ goal: string; jobTitle: string; bio: string; location: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Stable key: prefer user id, fall back to email so the check works even if id is absent
  const candidateKey = session?.user?.id || session?.user?.email || "";

  useEffect(() => {
    if (!candidateKey) return;
    try {
      const raw = localStorage.getItem(`elevate_onboarding_${candidateKey}`);
      if (raw) setOnboardingData(JSON.parse(raw));
      // Show wizard if this candidate has never completed onboarding on this browser
      const done = localStorage.getItem(`elevate_onboarded_${candidateKey}`);
      if (!done) setShowOnboarding(true);
    } catch { /* ignore */ }
  }, [candidateKey]);

  function handleOnboardingComplete() {
    setShowOnboarding(false);
    // Reload onboarding data so Welcome Message and sidebar reflect new answers
    try {
      const raw = localStorage.getItem(`elevate_onboarding_${candidateKey}`);
      if (raw) setOnboardingData(JSON.parse(raw));
    } catch { /* ignore */ }
  }

  const goalLabel = onboardingData?.goal ? (GOAL_LABELS[onboardingData.goal] ?? onboardingData.goal) : "landing a similar job";
  const candidateGoal = goalLabel;

  // Show onboarding wizard overlay for new candidates
  if (showOnboarding && candidateKey) {
    return (
      <OnboardingWizard
        candidateName={fullName}
        candidateId={candidateKey}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (activeNav === "orientation-welcome") {
    return (
      <div className="flex h-full overflow-hidden">
        <Sidebar activeId={activeNav} onSelect={setActiveNav} goalLabel={candidateGoal} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <WelcomeMessage fullName={fullName} goal={candidateGoal} bio={onboardingData?.bio} jobTitle={onboardingData?.jobTitle} location={onboardingData?.location} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar activeId={activeNav} onSelect={setActiveNav} goalLabel={candidateGoal} />

      {/* ── Main scroll area ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-5 p-6 min-h-full">

          {/* ── Content column ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Greeting */}
            <div>
              <h1 className="text-xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{greeting}, {firstName}!</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{quote}</p>
            </div>

            {/* ── Hero cards ── */}
            <div className="grid grid-cols-3 gap-4">

              {/* Action Plan */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-[15px]">Action Plan</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">You&apos;re on Day One.</p>
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground/30 mt-0.5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center shrink-0">
                    <ProgressRing pct={2} />
                    <span className="absolute text-[13px] font-bold text-foreground">2%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Not sure where to start?{" "}
                    <span className="text-primary font-medium cursor-pointer hover:underline">Click here</span>
                    {" "}and get started on the plan we created for you!
                  </p>
                </div>
                <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                  View Your Weekly Actions
                </button>
              </div>

              {/* Target Jobs */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground text-[15px]">Target Jobs</h3>
                  <Briefcase className="h-4 w-4 text-primary/50 mt-0.5" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  With My Jobs you can easily track your job search progress. Get started by saving a few target jobs now.
                </p>
                <div className="mt-auto space-y-2">
                  <button className="w-full rounded-xl border border-primary/30 py-2 text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5">
                    <Search className="h-3.5 w-3.5" /> Search Job Postings
                  </button>
                  <button className="w-full rounded-xl border border-border py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-center gap-1.5">
                    <List className="h-3.5 w-3.5" /> Job Boards List
                  </button>
                </div>
              </div>

              {/* Meet Vera */}
              <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-foreground text-[15px]">Meet Vera</h3>
                  <Sparkles className="h-4 w-4 text-primary/50 mt-0.5" />
                </div>
                <p className="text-xs font-medium text-foreground">Meet Vera, Your AI-Based Assistant</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Getting started can be hard but that&apos;s where Vera comes in. Ask for career advice, CV feedback, interview prep, and more.
                </p>
                <button className="mt-auto w-full rounded-xl border border-primary py-2.5 text-[13px] font-semibold text-primary hover:bg-primary/10 transition-colors">
                  Learn About Vera
                </button>
              </div>
            </div>

            {/* ── Lower row ── */}
            <div className="grid grid-cols-2 gap-4">

              {/* Job Search Tools */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-semibold text-foreground text-[15px]">Job Search Tools</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Search for posted opportunities or use our catalog of job boards.
                  </p>
                </div>
                <div className="divide-y divide-border">
                  {PLACEHOLDER_JOBS.map((job) => (
                    <div key={job.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white",
                        avatarColor(job.company)
                      )}>
                        {job.company[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">{job.title}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{job.company}</span>
                          <span className="mx-0.5">·</span>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{job.location}</span>
                        </p>
                      </div>
                      <button className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coach Insights */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h3 className="font-semibold text-foreground text-[15px]">Most Recent Coach Insights</h3>
                </div>
                <div className="divide-y divide-border">
                  {PLACEHOLDER_INSIGHTS.map((article) => (
                    <div key={article.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold text-white",
                        avatarColor(article.author)
                      )}>
                        {article.author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-medium text-foreground leading-snug line-clamp-2">{article.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{article.author} · {article.date}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                          <ExternalLink className="h-3 w-3" /> Read Now
                        </button>
                        <button className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                          <Volume2 className="h-3 w-3" /> Listen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel: Reminders ── */}
          <aside className="w-64 shrink-0 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-foreground text-[15px]">Reminders</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Job search can be stressful. Let us help you plan your day to day.
                </p>
              </div>
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-[13px] font-medium text-foreground hover:bg-sidebar-accent transition-colors">
                <Plus className="h-4 w-4" /> New Reminder
              </button>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell className="h-7 w-7 text-muted-foreground/20 mb-2" />
                <p className="text-[13px] text-muted-foreground">No reminders yet</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">Add one to stay on track</p>
              </div>
              <button className="text-[12px] text-primary hover:underline w-full text-center">
                See All Reminders
              </button>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">Quick Links</p>
              {[
                { label: "See All Reminders", Icon: Bell },
                { label: "View Action Plan",  Icon: Target },
                { label: "My Sessions",       Icon: Calendar },
                { label: "My Coach",          Icon: UserCircle },
              ].map(({ label, Icon }) => (
                <button key={label} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
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
