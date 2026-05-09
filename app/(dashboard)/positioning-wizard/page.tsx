"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, Download, RotateCcw } from "lucide-react";

interface FormState {
  companyName: string;
  industry: string;
  founded: string;
  teamSize: string;
  category: string;
  competitor1: string;
  competitor2: string;
  competitor3: string;
  icpJobTitle: string;
  icpCompanySize: string;
  icpPainPoint: string;
  icpGoal: string;
  differentiator: string;
  lossQuestion: string;
  value1: string;
  value2: string;
  value3: string;
  tone: string;
}

const brandValues = [
  "Innovation", "Trust", "Simplicity", "Excellence", "Boldness",
  "Authenticity", "Empathy", "Speed", "Quality", "Community",
];

const toneOptions = ["Professional", "Friendly", "Bold", "Playful", "Authoritative"];

const teamSizeOptions = ["1-10", "11-50", "51-200", "200+"];

const badgeColors: Record<string, string> = {
  Innovation: "bg-violet-500/20 text-violet-300",
  Trust: "bg-sky-500/20 text-sky-300",
  Simplicity: "bg-emerald-500/20 text-emerald-300",
  Excellence: "bg-amber-500/20 text-amber-300",
  Boldness: "bg-red-500/20 text-red-300",
  Authenticity: "bg-pink-500/20 text-pink-300",
  Empathy: "bg-teal-500/20 text-teal-300",
  Speed: "bg-orange-500/20 text-orange-300",
  Quality: "bg-indigo-500/20 text-indigo-300",
  Community: "bg-lime-500/20 text-lime-300",
};

const initialForm: FormState = {
  companyName: "", industry: "", founded: "", teamSize: "",
  category: "", competitor1: "", competitor2: "", competitor3: "",
  icpJobTitle: "", icpCompanySize: "", icpPainPoint: "", icpGoal: "",
  differentiator: "", lossQuestion: "",
  value1: "", value2: "", value3: "", tone: "",
};

function generateTaglines(form: FormState): string[] {
  const company = form.companyName || "Your Company";
  const diff = form.differentiator
    ? form.differentiator.split(" ").slice(0, 4).join(" ")
    : "solve the problem";
  const goal = form.icpGoal || "grow faster";
  const category = form.category || "solution";

  return [
    `${diff}. ${goal}. That's ${company}.`,
    `The ${category} built for teams who refuse to settle.`,
    `Stop guessing. Start ${goal.toLowerCase()}. ${company} makes it possible.`,
  ];
}

export default function PositioningWizardPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);

  const set = (key: keyof FormState, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const inputClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  const selectClass =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  const labelClass = "text-sm font-medium text-foreground";

  const taglines = generateTaglines(form);

  const totalSteps = 6;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Positioning Wizard"
        description="Define your unique market position with a guided 5-step framework."
      />

      <div className="flex-1 p-6">
        {/* Progress Bar */}
        {step < 6 && (
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Step {step} of 5</span>
              <span className="text-xs text-muted-foreground">
                {["Company Info", "Competition", "Ideal Customer", "Differentiators", "Brand Values"][step - 1]}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary transition-all"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between">
              {["Info", "Competition", "ICP", "Differentiators", "Values"].map((label, idx) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                    step > idx + 1 ? "bg-emerald-500 text-white" : step === idx + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {step > idx + 1 ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                  </div>
                  <span className={cn("hidden text-xs sm:inline", step === idx + 1 ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Let's start with the basics about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Company Name</label>
                <input className={inputClass} placeholder="e.g. NovaTech Solutions" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Industry</label>
                <input className={inputClass} placeholder="e.g. B2B SaaS, Fintech, Agency" value={form.industry} onChange={(e) => set("industry", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Founded (Year)</label>
                  <input className={inputClass} placeholder="e.g. 2021" value={form.founded} onChange={(e) => set("founded", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Team Size</label>
                  <select className={selectClass} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)}>
                    <option value="">Select...</option>
                    {teamSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <Button className="w-full gap-2" disabled={!form.companyName || !form.industry} onClick={() => setStep(2)}>
                Next: Competition <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Your Competition</CardTitle>
              <CardDescription>Define your category and identify who you compete against.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>What category do you compete in?</label>
                <input className={inputClass} placeholder="e.g. Marketing automation, HR software, Creative agency" value={form.category} onChange={(e) => set("category", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Competitor 1</label>
                <input className={inputClass} placeholder="Company name" value={form.competitor1} onChange={(e) => set("competitor1", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Competitor 2</label>
                <input className={inputClass} placeholder="Company name" value={form.competitor2} onChange={(e) => set("competitor2", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Competitor 3</label>
                <input className={inputClass} placeholder="Company name" value={form.competitor3} onChange={(e) => set("competitor3", e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={!form.category} onClick={() => setStep(3)}>
                  Next: ICP <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Ideal Customer Profile</CardTitle>
              <CardDescription>Who is your perfect customer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Primary Job Title</label>
                <input className={inputClass} placeholder="e.g. VP of Marketing, Founder, Head of Growth" value={form.icpJobTitle} onChange={(e) => set("icpJobTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Company Size</label>
                <input className={inputClass} placeholder="e.g. 50-200 employees, Series A startups" value={form.icpCompanySize} onChange={(e) => set("icpCompanySize", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Primary Pain Point</label>
                <input className={inputClass} placeholder="e.g. Inconsistent lead generation" value={form.icpPainPoint} onChange={(e) => set("icpPainPoint", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Primary Goal</label>
                <input className={inputClass} placeholder="e.g. Scale revenue without scaling headcount" value={form.icpGoal} onChange={(e) => set("icpGoal", e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={!form.icpJobTitle || !form.icpPainPoint} onClick={() => setStep(4)}>
                  Next: Differentiators <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Your Differentiators</CardTitle>
              <CardDescription>What makes you uniquely valuable?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>What makes you uniquely different?</label>
                <textarea
                  rows={4}
                  className={cn(inputClass, "resize-none")}
                  placeholder="e.g. We are the only platform that combines AI-driven content creation with real-time brand consistency enforcement..."
                  value={form.differentiator}
                  onChange={(e) => set("differentiator", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>What would customers lose if you disappeared?</label>
                <textarea
                  rows={4}
                  className={cn(inputClass, "resize-none")}
                  placeholder="e.g. They'd lose the ability to ship on-brand content 10x faster without hiring a full creative team..."
                  value={form.lossQuestion}
                  onChange={(e) => set("lossQuestion", e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(3)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={!form.differentiator} onClick={() => setStep(5)}>
                  Next: Values <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Brand Values & Tone</CardTitle>
              <CardDescription>Choose 3 core values and define your brand voice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {[
                  { label: "Brand Value 1", key: "value1" as keyof FormState },
                  { label: "Brand Value 2", key: "value2" as keyof FormState },
                  { label: "Brand Value 3", key: "value3" as keyof FormState },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-1.5">
                    <label className={labelClass}>{label}</label>
                    <select className={selectClass} value={form[key]} onChange={(e) => set(key, e.target.value)}>
                      <option value="">Select a value...</option>
                      {brandValues.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Brand Tone</label>
                <select className={selectClass} value={form.tone} onChange={(e) => set("tone", e.target.value)}>
                  <option value="">Select tone...</option>
                  {toneOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(4)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!form.value1 || !form.tone}
                  onClick={() => setStep(6)}
                >
                  Generate Document <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6 — Output */}
        {step === 6 && (
          <div className="mx-auto max-w-2xl space-y-6">
            <Card className="border-primary/30">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{form.companyName || "Your Company"} Positioning Document</CardTitle>
                    <CardDescription className="mt-1">{form.industry} · {form.teamSize} employees · Est. {form.founded}</CardDescription>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300">Complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Category */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
                  <p className="text-sm text-foreground">{form.category || "—"}</p>
                </div>

                {/* Ideal Customer */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ideal Customer</p>
                  <p className="text-sm text-foreground">
                    {form.icpJobTitle || "Decision-maker"} at {form.icpCompanySize || "mid-size"} companies struggling with{" "}
                    {form.icpPainPoint || "growth challenges"}, seeking {form.icpGoal || "better results"}.
                  </p>
                </div>

                {/* Differentiation Statement */}
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Differentiation Statement</p>
                  <p className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm italic text-foreground">
                    "Unlike {form.competitor1 || "the competition"}, {form.companyName || "we are"} the only {form.category || "solution"} that {form.differentiator ? form.differentiator.slice(0, 80) + "..." : "delivers unique value"} for {form.icpJobTitle || "our customers"}."
                  </p>
                </div>

                {/* Taglines */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tagline Options</p>
                  <div className="space-y-2">
                    {taglines.map((t, idx) => (
                      <div key={idx} className="flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                        <p className="text-sm text-foreground">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brand Values */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Values</p>
                  <div className="flex flex-wrap gap-2">
                    {[form.value1, form.value2, form.value3].filter(Boolean).map((v) => (
                      <span key={v} className={cn("rounded-full px-3 py-1 text-xs font-semibold", badgeColors[v] || "bg-primary/20 text-primary")}>{v}</span>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand Tone</p>
                  <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">{form.tone}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download Document
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={() => { setStep(1); setForm(initialForm); }}>
                <RotateCcw className="h-4 w-4" />
                Start New
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
