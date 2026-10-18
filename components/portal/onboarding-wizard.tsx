"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = 5;

const GOAL_OPTIONS = [
  { id: "new-role",      label: "Find a new role",          desc: "Same industry, next opportunity" },
  { id: "career-change", label: "Change careers",           desc: "New direction, new possibilities" },
  { id: "own-business",  label: "Start my own business",    desc: "Entrepreneurship & consulting" },
  { id: "retirement",    label: "Transition to retirement", desc: "Phased retirement planning" },
];

const TIMELINE_OPTIONS = [
  { id: "asap",      label: "As soon as possible", desc: "Actively searching now" },
  { id: "3months",   label: "Within 3 months",     desc: "Focused but thoughtful" },
  { id: "6months",   label: "Within 6 months",     desc: "Taking time to explore" },
  { id: "no-rush",   label: "No set timeline",     desc: "Open to the right fit" },
];

const PRIORITY_OPTIONS = [
  { id: "cv",         label: "Polishing my CV" },
  { id: "linkedin",   label: "LinkedIn presence" },
  { id: "networking", label: "Building my network" },
  { id: "interviews", label: "Interview preparation" },
  { id: "salary",     label: "Salary negotiation" },
  { id: "clarity",    label: "Career clarity" },
];

interface Props {
  candidateName: string;
  candidateId: string;
  onComplete: () => void;
}

export function OnboardingWizard({ candidateName, candidateId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [timeline, setTimeline] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);

  const firstName = candidateName.split(" ")[0];

  function finish() {
    localStorage.setItem(`elevate_onboarded_${candidateId}`, "1");
    onComplete();
  }

  function next() {
    if (step < STEPS) setStep((s) => s + 1);
    else finish();
  }

  function togglePriority(id: string) {
    setPriorities((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  const canContinue =
    step === 1 ? true :
    step === 2 ? !!goal :
    step === 3 ? !!timeline :
    step === 4 ? priorities.length > 0 :
    true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg">
        {/* Step tracker */}
        <div className="mb-8 flex items-center justify-center">
          {Array.from({ length: STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                s < step  ? "bg-primary text-primary-foreground" :
                s === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              )}>
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < STEPS && (
                <div className={cn("h-px w-12 transition-all", s < step ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="p-8 min-h-[340px] flex flex-col justify-center">

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
                  <h2 className="text-xl font-bold text-foreground">What&apos;s your primary goal?</h2>
                  <p className="text-sm text-muted-foreground mt-1">This helps us tailor your programme.</p>
                </div>
                <div className="space-y-2.5">
                  {GOAL_OPTIONS.map((o) => (
                    <button key={o.id} onClick={() => setGoal(o.id)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3.5 text-left transition-all",
                        goal === o.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                      )}>
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Timeline */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">What&apos;s your timeline?</h2>
                  <p className="text-sm text-muted-foreground mt-1">How soon are you looking to land?</p>
                </div>
                <div className="space-y-2.5">
                  {TIMELINE_OPTIONS.map((o) => (
                    <button key={o.id} onClick={() => setTimeline(o.id)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3.5 text-left transition-all",
                        timeline === o.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                      )}>
                      <p className="text-sm font-semibold text-foreground">{o.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 — Priorities */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-foreground">What are your priorities?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Select everything that applies to you.</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRIORITY_OPTIONS.map((o) => {
                    const active = priorities.includes(o.id);
                    return (
                      <button key={o.id} onClick={() => togglePriority(o.id)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left transition-all",
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40 hover:bg-sidebar-accent"
                        )}>
                        <div className="flex items-center gap-2">
                          {active && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />}
                          <p className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                            {o.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
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
  );
}
