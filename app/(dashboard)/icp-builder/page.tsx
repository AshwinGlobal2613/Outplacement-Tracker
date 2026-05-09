"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, Users } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface ICPForm {
  // Step 1 - Demographics
  jobTitles: string;
  seniority: string;
  companySize: string;
  industry: string;
  geography: string;
  // Step 2 - Firmographics
  revenueRange: string;
  businessModel: string[];
  growthStage: string;
  techSophistication: string;
  // Step 3 - Psychographics
  frustrations: string[];
  goals: string[];
  learningChannels: string[];
  // Step 4 - Buying Behavior
  budgetAuthority: string;
  decisionTimeline: string;
  buyingTriggers: string[];
  commonObjections: string[];
}

const seniorityOptions = ["Entry", "Mid-Level", "Senior", "Director", "VP", "C-Suite"];
const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];
const revenueOptions = ["Under $1M", "$1M-$5M", "$5M-$20M", "$20M-$100M", "$100M+"];
const growthStageOptions = ["Pre-seed", "Seed", "Series A", "Series B", "Growth", "Enterprise"];
const frustrationOptions = ["Lack of time", "Poor ROI on marketing", "Difficulty scaling", "Team misalignment", "Unclear strategy", "Too many tools"];
const goalOptions = ["Grow revenue", "Build brand awareness", "Generate leads", "Retain customers", "Launch new product", "Expand to new markets"];
const learningOptions = ["LinkedIn", "Podcasts", "Newsletters", "Industry events", "Peer recommendations", "YouTube"];
const budgetOptions = ["Full authority", "Influences decision", "No authority"];
const timelineOptions = ["Under 2 weeks", "1-3 months", "3-6 months", "6+ months"];
const triggerOptions = ["Competitor activity", "New funding", "Leadership change", "Hitting a growth ceiling", "Failed previous solution"];
const objectionOptions = ["Price too high", "Need internal buy-in", "Too busy to implement", "Not the right time", "Prefer existing solution"];

const objectionResponses: Record<string, string> = {
  "Price too high": "Lead with ROI: calculate how much the problem costs them now vs. your price.",
  "Need internal buy-in": "Provide a business case template and offer a stakeholder presentation.",
  "Too busy to implement": "Emphasize your onboarding support and typical time-to-value.",
  "Not the right time": "Ask what would need to be true for the timing to be right. Plant a seed.",
  "Prefer existing solution": "Acknowledge their current tool, then contrast specific gaps you solve.",
};

const channelRecommendations: Record<string, string> = {
  LinkedIn: "LinkedIn — organic posts + sponsored content",
  Podcasts: "Podcast advertising + guest appearances",
  Newsletters: "Newsletter sponsorships + your own email list",
  "Industry events": "Conference sponsorships + speaking slots",
  "Peer recommendations": "Referral program + case studies + G2 reviews",
  YouTube: "YouTube tutorials + product demos",
};

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

const initialForm: ICPForm = {
  jobTitles: "", seniority: "", companySize: "", industry: "", geography: "",
  revenueRange: "", businessModel: [], growthStage: "", techSophistication: "",
  frustrations: [], goals: [], learningChannels: [],
  budgetAuthority: "", decisionTimeline: "", buyingTriggers: [], commonObjections: [],
};

export default function ICPBuilderPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<ICPForm>(initialForm);
  const [generated, setGenerated] = useState(false);

  const inputClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const selectClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const labelClass = "text-sm font-medium text-foreground";

  const handleGenerate = () => {
    setGenerated(true);
    setStep(5);
  };

  const profileName = `The ${form.seniority || "Growth-Focused"} ${form.jobTitles ? form.jobTitles.split(",")[0].trim() : "Leader"} at a ${form.growthStage || "Scaling"} Company`;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="ICP Builder"
        description="Build a detailed ideal customer profile with demographics, goals, and buying behavior."
      />

      <div className="flex-1 p-6">
        {/* Progress */}
        {step < 5 && (
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Step {step} of 4</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted">
              <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            <div className="mt-3 flex justify-between">
              {["Demographics", "Firmographics", "Psychographics", "Buying"].map((label, idx) => (
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

        {/* Step 1 - Demographics */}
        {step === 1 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Demographics</CardTitle>
              <CardDescription>Define who your ideal customer is at a personal level.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Primary Job Titles</label>
                <input className={inputClass} placeholder="e.g. VP Marketing, Head of Growth, CMO" value={form.jobTitles} onChange={(e) => setForm(p => ({ ...p, jobTitles: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Seniority Level</label>
                <select className={selectClass} value={form.seniority} onChange={(e) => setForm(p => ({ ...p, seniority: e.target.value }))}>
                  <option value="">Select seniority...</option>
                  {seniorityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Company Size</label>
                <select className={selectClass} value={form.companySize} onChange={(e) => setForm(p => ({ ...p, companySize: e.target.value }))}>
                  <option value="">Select size...</option>
                  {companySizeOptions.map(o => <option key={o} value={o}>{o} employees</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Industry</label>
                <input className={inputClass} placeholder="e.g. SaaS, E-commerce, Healthcare" value={form.industry} onChange={(e) => setForm(p => ({ ...p, industry: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Geography</label>
                <input className={inputClass} placeholder="e.g. North America, Global, EMEA" value={form.geography} onChange={(e) => setForm(p => ({ ...p, geography: e.target.value }))} />
              </div>
              <Button className="w-full gap-2" disabled={!form.jobTitles || !form.seniority} onClick={() => setStep(2)}>
                Next: Firmographics <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 - Firmographics */}
        {step === 2 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Firmographics</CardTitle>
              <CardDescription>Describe the type of company your ideal customer works at.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Revenue Range</label>
                <select className={selectClass} value={form.revenueRange} onChange={(e) => setForm(p => ({ ...p, revenueRange: e.target.value }))}>
                  <option value="">Select revenue...</option>
                  {revenueOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Business Model</label>
                <div className="flex flex-wrap gap-2">
                  {["B2B", "B2C", "D2C"].map(bm => (
                    <button
                      key={bm}
                      onClick={() => setForm(p => ({ ...p, businessModel: toggleItem(p.businessModel, bm) }))}
                      className={cn(
                        "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                        form.businessModel.includes(bm) ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >{bm}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Growth Stage</label>
                <select className={selectClass} value={form.growthStage} onChange={(e) => setForm(p => ({ ...p, growthStage: e.target.value }))}>
                  <option value="">Select stage...</option>
                  {growthStageOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Tech Sophistication</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, techSophistication: t }))}
                      className={cn(
                        "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                        form.techSophistication === t ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={!form.revenueRange || !form.growthStage} onClick={() => setStep(3)}>
                  Next: Psychographics <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 - Psychographics */}
        {step === 3 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Psychographics</CardTitle>
              <CardDescription>Understand your customer's mindset, motivations, and habits.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className={labelClass}>Top Frustrations (pick up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {frustrationOptions.map(f => (
                    <button
                      key={f}
                      disabled={!form.frustrations.includes(f) && form.frustrations.length >= 3}
                      onClick={() => setForm(p => ({ ...p, frustrations: toggleItem(p.frustrations, f) }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        form.frustrations.includes(f) ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Primary Goals (pick up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {goalOptions.map(g => (
                    <button
                      key={g}
                      disabled={!form.goals.includes(g) && form.goals.length >= 3}
                      onClick={() => setForm(p => ({ ...p, goals: toggleItem(p.goals, g) }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        form.goals.includes(g) ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-border text-muted-foreground hover:border-emerald-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >{g}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>How They Learn & Stay Informed</label>
                <div className="flex flex-wrap gap-2">
                  {learningOptions.map(l => (
                    <button
                      key={l}
                      onClick={() => setForm(p => ({ ...p, learningChannels: toggleItem(p.learningChannels, l) }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        form.learningChannels.includes(l) ? "border-sky-500 bg-sky-500/20 text-sky-300" : "border-border text-muted-foreground hover:border-sky-500/50"
                      )}
                    >{l}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={form.frustrations.length === 0 || form.goals.length === 0} onClick={() => setStep(4)}>
                  Next: Buying Behavior <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 - Buying Behavior */}
        {step === 4 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Buying Behavior</CardTitle>
              <CardDescription>How does your ideal customer make purchase decisions?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className={labelClass}>Budget Authority</label>
                <select className={selectClass} value={form.budgetAuthority} onChange={(e) => setForm(p => ({ ...p, budgetAuthority: e.target.value }))}>
                  <option value="">Select authority level...</option>
                  {budgetOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Typical Decision Timeline</label>
                <select className={selectClass} value={form.decisionTimeline} onChange={(e) => setForm(p => ({ ...p, decisionTimeline: e.target.value }))}>
                  <option value="">Select timeline...</option>
                  {timelineOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Buying Triggers</label>
                <div className="flex flex-wrap gap-2">
                  {triggerOptions.map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(p => ({ ...p, buyingTriggers: toggleItem(p.buyingTriggers, t) }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        form.buyingTriggers.includes(t) ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-border text-muted-foreground hover:border-amber-500/50"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Common Objections</label>
                <div className="flex flex-wrap gap-2">
                  {objectionOptions.map(o => (
                    <button
                      key={o}
                      onClick={() => setForm(p => ({ ...p, commonObjections: toggleItem(p.commonObjections, o) }))}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium border transition-colors",
                        form.commonObjections.includes(o) ? "border-red-500 bg-red-500/20 text-red-300" : "border-border text-muted-foreground hover:border-red-500/50"
                      )}
                    >{o}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(3)}>
                  <ChevronLeft className="h-4 w-4" /> Back
                </Button>
                <Button className="flex-1 gap-2" disabled={!form.budgetAuthority || !form.decisionTimeline} onClick={handleGenerate}>
                  Generate ICP Profile <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5 - Output */}
        {step === 5 && generated && (
          <div className="mx-auto max-w-2xl space-y-5">
            <Card className="border-primary/30">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{profileName}</CardTitle>
                    <CardDescription className="mt-1">{form.industry || "Your Industry"} · {form.geography || "Global"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Demographics */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demographics</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Job Titles: </span><span className="text-foreground">{form.jobTitles}</span></div>
                    <div><span className="text-muted-foreground">Seniority: </span><span className="text-foreground">{form.seniority}</span></div>
                    <div><span className="text-muted-foreground">Company Size: </span><span className="text-foreground">{form.companySize} employees</span></div>
                    <div><span className="text-muted-foreground">Revenue: </span><span className="text-foreground">{form.revenueRange}</span></div>
                    <div><span className="text-muted-foreground">Stage: </span><span className="text-foreground">{form.growthStage}</span></div>
                    <div><span className="text-muted-foreground">Tech: </span><span className="text-foreground">{form.techSophistication}</span></div>
                  </div>
                </div>

                {/* Pain Points */}
                {form.frustrations.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Pain Points</p>
                    <ul className="space-y-1">
                      {form.frustrations.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Goals */}
                {form.goals.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goals & Motivations</p>
                    <ul className="space-y-1">
                      {form.goals.map(g => (
                        <li key={g} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* How They Buy */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">How They Buy</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Budget Authority: </span><span className="text-foreground">{form.budgetAuthority}</span></p>
                    <p><span className="text-muted-foreground">Decision Timeline: </span><span className="text-foreground">{form.decisionTimeline}</span></p>
                    {form.buyingTriggers.length > 0 && (
                      <p><span className="text-muted-foreground">Triggers: </span><span className="text-foreground">{form.buyingTriggers.join(", ")}</span></p>
                    )}
                  </div>
                </div>

                {/* Objections */}
                {form.commonObjections.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Common Objections & Responses</p>
                    <div className="space-y-3">
                      {form.commonObjections.map(o => (
                        <div key={o} className="rounded-lg border border-border bg-card p-3">
                          <p className="text-sm font-semibold text-foreground">{o}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{objectionResponses[o] || "Acknowledge and address with relevant proof."}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Channels */}
                {form.learningChannels.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommended Channels</p>
                    <ul className="space-y-1">
                      {form.learningChannels.map(l => (
                        <li key={l} className="flex items-center gap-2 text-sm text-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />
                          {channelRecommendations[l] || l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <Users className="h-4 w-4" />
                Use This ICP
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => { setStep(1); setForm(initialForm); setGenerated(false); }}>
                Build New ICP
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
