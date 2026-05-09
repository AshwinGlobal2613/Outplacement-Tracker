"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, RotateCcw, CalendarDays } from "lucide-react";

type Step = 1 | 2 | 3;

interface FormData {
  companyName: string;
  industry: string;
  website: string;
}

interface Scores {
  brandClarity: number;
  visualConsistency: number;
  differentiation: number;
  toneOfVoice: number;
  targetAudienceClarity: number;
  contentQuality: number;
  digitalPresence: number;
  customerExperience: number;
  brandStory: number;
  marketPositioning: number;
}

const dimensions: { key: keyof Scores; name: string; description: string }[] = [
  { key: "brandClarity", name: "Brand Clarity", description: "How clearly your brand communicates what it does and who it serves." },
  { key: "visualConsistency", name: "Visual Consistency", description: "Consistency of logos, colors, and design across all touchpoints." },
  { key: "differentiation", name: "Differentiation", description: "How distinct and memorable your brand is vs. competitors." },
  { key: "toneOfVoice", name: "Tone of Voice", description: "Consistency and appropriateness of your brand voice across content." },
  { key: "targetAudienceClarity", name: "Target Audience Clarity", description: "How well-defined and understood your ideal customer is." },
  { key: "contentQuality", name: "Content Quality", description: "Quality, relevance, and consistency of your content output." },
  { key: "digitalPresence", name: "Digital Presence", description: "Strength of your online presence across website and social channels." },
  { key: "customerExperience", name: "Customer Experience", description: "How well your brand delivers on its promise at every touchpoint." },
  { key: "brandStory", name: "Brand Story", description: "How compelling and authentic your origin story and mission are." },
  { key: "marketPositioning", name: "Market Positioning", description: "How clearly you own a specific position in your market category." },
];

const industryOptions = [
  "SaaS / Technology", "E-commerce / Retail", "Professional Services",
  "Health & Wellness", "Finance / FinTech", "Education / EdTech",
  "Media / Entertainment", "Real Estate", "Food & Beverage", "Other",
];

const recommendations: Record<keyof Scores, string> = {
  brandClarity: "Refine your one-sentence brand promise and ensure it appears consistently across all primary touchpoints.",
  visualConsistency: "Create a brand style guide with defined color palette, typography rules, and logo usage standards.",
  differentiation: "Map your unique value against the top 3 competitors and identify a white space you can own.",
  toneOfVoice: "Document your brand voice with example phrases, banned words, and tone variations by channel.",
  targetAudienceClarity: "Build a detailed ICP (Ideal Customer Profile) using our ICP Builder tool.",
  contentQuality: "Develop a content framework with defined pillars, formats, and a quality review process.",
  digitalPresence: "Audit your website, social bios, and Google profile — ensure NAP consistency and updated visuals.",
  customerExperience: "Map the full customer journey and identify the top 3 friction points to eliminate.",
  brandStory: "Craft a StoryBrand-style narrative that positions your customer as the hero and your brand as the guide.",
  marketPositioning: "Use our Positioning Wizard to define your category, differentiation, and positioning statement.",
};

function getScoreLabel(score: number): { label: string; color: string } {
  if (score < 40) return { label: "Needs Work", color: "text-red-400" };
  if (score < 70) return { label: "Building Momentum", color: "text-amber-400" };
  if (score < 85) return { label: "Strong Foundation", color: "text-sky-400" };
  return { label: "Brand Leader", color: "text-emerald-400" };
}

function getBarColor(score: number): string {
  if (score <= 1) return "bg-red-500";
  if (score <= 2) return "bg-orange-500";
  if (score <= 3) return "bg-amber-500";
  if (score <= 4) return "bg-sky-500";
  return "bg-emerald-500";
}

export default function BrandScorecardPage() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    industry: "",
    website: "",
  });
  const [scores, setScores] = useState<Scores>({
    brandClarity: 0,
    visualConsistency: 0,
    differentiation: 0,
    toneOfVoice: 0,
    targetAudienceClarity: 0,
    contentQuality: 0,
    digitalPresence: 0,
    customerExperience: 0,
    brandStory: 0,
    marketPositioning: 0,
  });

  const allScored = Object.values(scores).every((v) => v > 0);
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 10;
  const overallScore = Math.round(avgScore * 20);
  const { label: scoreLabel, color: scoreColor } = getScoreLabel(overallScore);

  const lowestDimensions = [...dimensions]
    .sort((a, b) => scores[a.key] - scores[b.key])
    .slice(0, 3);

  const handleRestart = () => {
    setStep(1);
    setFormData({ companyName: "", industry: "", website: "" });
    setScores({
      brandClarity: 0,
      visualConsistency: 0,
      differentiation: 0,
      toneOfVoice: 0,
      targetAudienceClarity: 0,
      contentQuality: 0,
      digitalPresence: 0,
      customerExperience: 0,
      brandStory: 0,
      marketPositioning: 0,
    });
  };

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Brand Scorecard"
        description="Audit your brand across 10 key dimensions and get an actionable improvement roadmap."
      />

      <div className="flex-1 p-6">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center gap-2">
          {[
            { num: 1, label: "Company Info" },
            { num: 2, label: "Rate Dimensions" },
            { num: 3, label: "Results" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                    step === s.num
                      ? "bg-primary text-primary-foreground"
                      : step > s.num
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    step === s.num ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell us about your brand before we begin the audit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData((p) => ({ ...p, industry: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select your industry...</option>
                  {industryOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Website</label>
                <input
                  type="text"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                className="w-full"
                disabled={!formData.companyName || !formData.industry}
                onClick={() => setStep(2)}
              >
                Begin Audit
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground">Rate Your Brand</h2>
              <p className="text-sm text-muted-foreground">Score each dimension from 1 (poor) to 5 (excellent).</p>
            </div>
            {dimensions.map((dim) => (
              <Card key={dim.key}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{dim.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{dim.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setScores((p) => ({ ...p, [dim.key]: n }))}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-bold transition-colors",
                            scores[dim.key] === n
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          )}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="pt-2">
              <Button
                className="w-full"
                disabled={!allScored}
                onClick={() => setStep(3)}
              >
                View Results
              </Button>
              {!allScored && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Rate all 10 dimensions to continue
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="mx-auto max-w-2xl space-y-6">
            {/* Header */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">{formData.companyName}</p>
                <p className="mt-2 text-6xl font-black text-foreground">{overallScore}</p>
                <p className="text-sm text-muted-foreground">out of 100</p>
                <span className={cn("mt-3 inline-block rounded-full px-4 py-1 text-sm font-semibold", scoreColor, "bg-current/10")}>
                  <span className={scoreColor}>{scoreLabel}</span>
                </span>
              </CardContent>
            </Card>

            {/* Dimension Bars */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dimension Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dimensions.map((dim) => {
                  const score = scores[dim.key];
                  const pct = (score / 5) * 100;
                  return (
                    <div key={dim.key}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{dim.name}</span>
                        <span className="text-sm font-bold text-foreground">{score}/5</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={cn("h-2 rounded-full transition-all", getBarColor(score))}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended Actions</CardTitle>
                <CardDescription>Based on your 3 lowest-scoring dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lowestDimensions.map((dim, idx) => (
                  <div key={dim.key} className="flex gap-4">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{dim.name}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{recommendations[dim.key]}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button className="flex-1 gap-2">
                <CalendarDays className="h-4 w-4" />
                Book Strategy Session
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4" />
                Restart Audit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
