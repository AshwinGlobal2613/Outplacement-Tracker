"use client";

import { useState, useRef } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Zap,
  Briefcase, Shuffle, Store, Trophy, Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = 5;

const GOAL_OPTIONS = [
  { id: "new-role",      label: "Find a new role",          Icon: Briefcase },
  { id: "career-change", label: "Change careers",           Icon: Shuffle },
  { id: "own-business",  label: "Work for myself",          Icon: Store },
  { id: "retirement",    label: "Transition to retirement", Icon: Trophy },
];

const LAST_ROLE_OPTIONS = [
  { id: "individual", label: "Employee or Individual Contributor" },
  { id: "manager",    label: "Manager" },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { id: "entry",   label: "Entry to Mid-Level" },
  { id: "mid",     label: "Manager to Director" },
  { id: "senior",  label: "VP to C Level" },
];

const UPSKILLING_OPTIONS = [
  { id: "yes",       label: "Yes" },
  { id: "no",        label: "No" },
  { id: "not-sure",  label: "I'm not sure" },
];

// Context-aware field labels for step 3 based on goal
const GOAL_FIELDS: Record<string, { jobTitle: string; location: string; industry: string; bio: string }> = {
  "new-role":      { jobTitle: "Your desired job title",    location: "Your desired location",    industry: "Your desired industry",    bio: "Tell us about yourself, including your goals, what you are seeking from your next role, motivations, and more" },
  "career-change": { jobTitle: "Your desired job title",    location: "Your desired location",    industry: "Your desired industry",    bio: "Tell us about yourself, including your goals, what you are seeking from your next role, motivations, and more" },
  "own-business":  { jobTitle: "What business opportunities are you interested in?", location: "Your desired location", industry: "Your desired industry", bio: "" },
  "retirement":    { jobTitle: "Any part-time role in mind", location: "Preferred location",        industry: "Area of interest",          bio: "Tell us about your vision for the next chapter and what you'd like to focus on" },
};

interface AboutInfo {
  jobTitle: string;
  location: string;
  industry: string;
  timezone: string;
  linkedin: string;
  bio: string;
  cvFileName: string;
}

interface Props {
  candidateName: string;
  candidateId: string;
  onComplete: () => void;
}

export function OnboardingWizard({ candidateName, candidateId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [lastRole, setLastRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [upskilling, setUpskilling] = useState("");
  const [about, setAbout] = useState<AboutInfo>({
    jobTitle: "", location: "", industry: "", timezone: "",
    linkedin: "", bio: "", cvFileName: "",
  });
  const cvInputRef = useRef<HTMLInputElement>(null);
  const bioMax = 500;

  const firstName = candidateName.split(" ")[0];
  const fields = GOAL_FIELDS[goal] ?? GOAL_FIELDS["new-role"];

  function finish() {
    localStorage.setItem(`elevate_onboarded_${candidateId}`, "1");
    onComplete();
  }

  function next() {
    if (step < STEPS) setStep((s) => s + 1);
    else finish();
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  function setAboutField(key: keyof AboutInfo, value: string) {
    setAbout((a) => ({ ...a, [key]: value }));
  }

  const canContinue =
    step === 1 ? true :
    step === 2 ? !!goal :
    step === 3 ? true :
    step === 4 ? !!lastRole && !!experienceLevel && !!upskilling :
    true;

  const inputCls = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const labelCls = "block text-sm font-semibold text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto">
        {/* Step tracker */}
        <div className="mb-8 flex items-center justify-center">
          {Array.from({ length: STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                  s < step  ? "bg-primary text-primary-foreground" :
                  s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                  "bg-muted text-muted-foreground"
                )}>
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                <span className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  s === step ? "text-foreground" : "text-muted-foreground"
                )}>
                  Step {s}
                </span>
              </div>
              {s < STEPS && (
                <div className={cn("h-px w-10 mb-5 transition-all", s < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className={cn("p-8 flex flex-col justify-center", step === 3 ? "min-h-[400px]" : "min-h-[340px]")}>

            {/* Step 1 — Welcome */}
            {step === 1 && (
              <div className="text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Welcome, {firstName}!</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to your career transition programme. Whether you&apos;re looking for a new job, a career change, or something entirely different — we help you get there.
                </p>
                <p className="text-sm text-muted-foreground/70 pt-1">
                  We&apos;ll ask you a few quick questions to personalise your experience.
                </p>
              </div>
            )}

            {/* Step 2 — Goal */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">What are you looking for?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Right now I&apos;m interested in...</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map(({ id, label, Icon }) => {
                    const active = goal === id;
                    return (
                      <button key={id} onClick={() => setGoal(id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center gap-3 rounded-xl border px-4 py-6 text-center transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                        )}>
                        {active && (
                          <CheckCircle2 className="absolute top-2.5 right-2.5 h-4 w-4 text-primary-foreground" />
                        )}
                        <Icon className={cn("h-7 w-7", active ? "text-primary-foreground" : "text-muted-foreground")} />
                        <p className={cn("text-sm font-semibold leading-snug", active ? "text-primary-foreground" : "text-foreground")}>
                          {label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Getting to know you */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Getting to know you better.</h2>
                  <p className="text-sm text-muted-foreground mt-1">We&apos;ll use this info to customise your platform experience.</p>
                </div>

                {/* Own-business: simplified 3-field layout */}
                {goal === "own-business" ? (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>{fields.jobTitle}</label>
                      <input
                        type="text"
                        value={about.jobTitle}
                        onChange={(e) => setAboutField("jobTitle", e.target.value)}
                        placeholder="e.g. E-commerce, Consulting, Freelance Design"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{fields.location}</label>
                      <input
                        type="text"
                        value={about.location}
                        onChange={(e) => setAboutField("location", e.target.value)}
                        placeholder="e.g. Dubai, UAE"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>{fields.industry}</label>
                      <input
                        type="text"
                        value={about.industry}
                        onChange={(e) => setAboutField("industry", e.target.value)}
                        placeholder="e.g. Technology, Retail, Professional Services"
                        className={inputCls}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {/* Left column */}
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>{fields.jobTitle}</label>
                        <input
                          type="text"
                          value={about.jobTitle}
                          onChange={(e) => setAboutField("jobTitle", e.target.value)}
                          placeholder="e.g. Marketing Manager"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{fields.location}</label>
                        <input
                          type="text"
                          value={about.location}
                          onChange={(e) => setAboutField("location", e.target.value)}
                          placeholder="e.g. Dubai, UAE"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{fields.industry}</label>
                        <input
                          type="text"
                          value={about.industry}
                          onChange={(e) => setAboutField("industry", e.target.value)}
                          placeholder="e.g. Finance & Banking"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Time zone</label>
                        <select
                          value={about.timezone}
                          onChange={(e) => setAboutField("timezone", e.target.value)}
                          className={cn(inputCls, "cursor-pointer")}
                        >
                          <option value="">Select time zone...</option>
                          <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                          <option value="Asia/Riyadh">Asia/Riyadh (AST +3)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="Europe/Paris">Europe/Paris (CET +1)</option>
                          <option value="America/New_York">America/New York (EST -5)</option>
                          <option value="America/Los_Angeles">America/Los Angeles (PST -8)</option>
                          <option value="Asia/Singapore">Asia/Singapore (SGT +8)</option>
                          <option value="Australia/Sydney">Australia/Sydney (AEDT +11)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Please upload your CV here</label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Don&apos;t have one? No worries! We will help create one with you.
                        </p>
                        <input
                          ref={cvInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => setAboutField("cvFileName", e.target.files?.[0]?.name ?? "")}
                        />
                        <button
                          onClick={() => cvInputRef.current?.click()}
                          className="flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                          <Paperclip className="h-4 w-4" />
                          {about.cvFileName ? about.cvFileName : "Upload CV"}
                        </button>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Please enter your LinkedIn URL</label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Don&apos;t have one? We can help! If you&apos;re interested in setting up your LinkedIn profile, you&apos;ll find resources on your dashboard to get started.
                        </p>
                        <input
                          type="url"
                          value={about.linkedin}
                          onChange={(e) => setAboutField("linkedin", e.target.value)}
                          placeholder="https://linkedin.com/in/yourname"
                          className={inputCls}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className={labelCls}>{fields.bio}</label>
                        <textarea
                          value={about.bio}
                          onChange={(e) => setAboutField("bio", e.target.value.slice(0, bioMax))}
                          placeholder="Share a bit about yourself..."
                          rows={7}
                          className={cn(inputCls, "resize-none")}
                        />
                        <p className="text-right text-xs text-muted-foreground mt-1">
                          {bioMax - about.bio.length} characters remaining
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Your Experience */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your Experience</h2>
                  <p className="text-sm text-muted-foreground mt-1">Help us personalise your programme.</p>
                </div>

                {/* Q1 */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-foreground">How would you describe your last role?</p>
                  <div className="space-y-2">
                    {LAST_ROLE_OPTIONS.map((o) => (
                      <label key={o.id} className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                        lastRole === o.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                      )}>
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          lastRole === o.id ? "border-primary" : "border-muted-foreground"
                        )}>
                          {lastRole === o.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" name="lastRole" value={o.id} checked={lastRole === o.id}
                          onChange={() => setLastRole(o.id)} className="sr-only" />
                        <span className={cn("text-sm font-medium", lastRole === o.id ? "text-foreground" : "text-muted-foreground")}>
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-foreground">What is your professional experience level?</p>
                  <div className="space-y-2">
                    {EXPERIENCE_LEVEL_OPTIONS.map((o) => (
                      <label key={o.id} className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                        experienceLevel === o.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                      )}>
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          experienceLevel === o.id ? "border-primary" : "border-muted-foreground"
                        )}>
                          {experienceLevel === o.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" name="experienceLevel" value={o.id} checked={experienceLevel === o.id}
                          onChange={() => setExperienceLevel(o.id)} className="sr-only" />
                        <span className={cn("text-sm font-medium", experienceLevel === o.id ? "text-foreground" : "text-muted-foreground")}>
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-foreground">Are you looking for retraining, education, or upskilling opportunities?</p>
                  <div className="space-y-2">
                    {UPSKILLING_OPTIONS.map((o) => (
                      <label key={o.id} className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                        upskilling === o.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                      )}>
                        <div className={cn(
                          "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                          upskilling === o.id ? "border-primary" : "border-muted-foreground"
                        )}>
                          {upskilling === o.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <input type="radio" name="upskilling" value={o.id} checked={upskilling === o.id}
                          onChange={() => setUpskilling(o.id)} className="sr-only" />
                        <span className={cn("text-sm font-medium", upskilling === o.id ? "text-foreground" : "text-muted-foreground")}>
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Ready */}
            {step === 5 && (
              <div className="text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">You&apos;re all set, {firstName}!</h2>
                  <p className="text-muted-foreground mt-2 leading-relaxed">
                    Your coach has been notified and your programme is ready. Let&apos;s start your journey.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-left space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your first steps</p>
                  {["Check your upcoming sessions", "Explore the resources your coach added", "Start building your CV"].map((s) => (
                    <div key={s} className="flex items-center gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <p className="text-sm text-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-muted/20 px-8 py-5">
            <button onClick={finish}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4">
              Skip to Dashboard
            </button>
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button onClick={back}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <button onClick={next} disabled={!canContinue}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all",
                  canContinue
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                )}>
                {step === STEPS ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
