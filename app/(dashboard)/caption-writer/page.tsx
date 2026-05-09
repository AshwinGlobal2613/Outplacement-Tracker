"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Sparkles, CheckCheck } from "lucide-react";

interface CaptionState {
  brandVoice: [string, string, string];
  brief: string;
  platform: string;
  tone: string;
  includeCTA: boolean | null;
  includeHashtags: boolean | null;
  generated: boolean;
}

const platforms = ["Instagram", "LinkedIn", "Facebook", "Twitter"];
const tones = ["Authentic", "Playful", "Professional", "Bold", "Witty"];

function generateCaptions(state: CaptionState) {
  const { brief, platform, tone, includeCTA, includeHashtags } = state;
  const topic = brief || "this topic";
  const ctaLine = includeCTA ? "\n\nSave this for later and share with someone who needs to hear it. 👇" : "";
  const hashtags = includeHashtags
    ? "\n\n#BrandBuilding #ContentStrategy #MarketingTips #GrowthMindset #BusinessStrategy"
    : "";

  const captions = [
    {
      label: "Option 1",
      style: "Hook-Forward",
      text: `Most people get this wrong when it comes to ${topic}.

They focus on the tactics — the tools, the templates, the hacks — and wonder why they're not seeing results.

The real issue? Strategy.

Without a clear foundation, even the best execution falls flat. Here's what actually moves the needle:

→ Know exactly who you're talking to
→ Have one clear message per piece of content
→ Create from a place of genuine perspective, not just trends

The brands winning right now aren't the ones posting the most. They're the ones posting with the most clarity.${ctaLine}${hashtags}`,
    },
    {
      label: "Option 2",
      style: "Story-Driven",
      text: `Last year, I almost made a huge mistake with ${topic}.

I was so focused on doing what everyone else was doing that I lost sight of what made our approach unique.

Then something clicked.

I stopped trying to copy what was working for others and started doubling down on our own perspective. The results were immediate.

Here's what I learned: authenticity compounds. Every time you show up as yourself — with your real opinions, real stories, real struggles — you build something that can't be replicated.

The shortcut is there is no shortcut. Show up, be real, be consistent.

What's one thing you've stopped doing that actually improved your results?${ctaLine}${hashtags}`,
    },
    {
      label: "Option 3",
      style: "Direct Value",
      text: `Here's how to improve your ${topic} in 3 steps:

1. Start with your audience, not your content
Before you write a single word, get crystal clear on who you're speaking to and what they need to hear right now.

2. Build one strong idea per post
Don't try to say everything. Say one thing really well. Depth beats breadth every time.

3. End with a clear next step
Every piece of content should have a purpose. Whether it's a question, a CTA, or a soft offer — know what you want your reader to do next.

Bookmark this and implement one step this week. Small, consistent action compounds fast.${ctaLine}${hashtags}`,
    },
  ];

  return captions;
}

export default function CaptionWriterPage() {
  const [state, setState] = useState<CaptionState>({
    brandVoice: ["", "", ""],
    brief: "",
    platform: "",
    tone: "",
    includeCTA: null,
    includeHashtags: null,
    generated: false,
  });
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const updateBrandVoice = (idx: number, value: string) => {
    const updated: [string, string, string] = [...state.brandVoice] as [string, string, string];
    updated[idx] = value;
    setState(p => ({ ...p, brandVoice: updated }));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const canGenerate = state.brief.trim().length > 5 && state.platform && state.tone;
  const captions = generateCaptions(state);

  const textareaClass = "w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";
  const selectClass = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Caption Writer"
        description="Generate on-brand captions trained on your voice for any platform."
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left - Configuration */}
          <div className="space-y-5">
            {/* Brand Voice Training */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Brand Voice Training</CardTitle>
                <CardDescription>Paste 3 example captions that represent how your brand speaks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[0, 1, 2].map((idx) => (
                  <div key={idx} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Example {idx + 1}</label>
                    <textarea
                      rows={3}
                      className={textareaClass}
                      placeholder="Paste an example caption that represents your brand..."
                      value={state.brandVoice[idx]}
                      onChange={(e) => updateBrandVoice(idx, e.target.value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Caption Brief */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Caption Brief</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">What's this post about?</label>
                  <textarea
                    rows={3}
                    className={textareaClass}
                    placeholder="e.g. Announcing our new product launch, sharing a personal lesson about scaling, promoting a webinar..."
                    value={state.brief}
                    onChange={(e) => setState(p => ({ ...p, brief: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Platform</label>
                    <select className={selectClass} value={state.platform} onChange={(e) => setState(p => ({ ...p, platform: e.target.value }))}>
                      <option value="">Select...</option>
                      {platforms.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Tone</label>
                    <select className={selectClass} value={state.tone} onChange={(e) => setState(p => ({ ...p, tone: e.target.value }))}>
                      <option value="">Select...</option>
                      {tones.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Include CTA?</label>
                  <div className="flex gap-2">
                    {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                      <button
                        key={label}
                        onClick={() => setState(p => ({ ...p, includeCTA: value }))}
                        className={cn(
                          "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                          state.includeCTA === value ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >{label}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Include Hashtags?</label>
                  <div className="flex gap-2">
                    {[{ label: "Yes", value: true }, { label: "No", value: false }].map(({ label, value }) => (
                      <button
                        key={label}
                        onClick={() => setState(p => ({ ...p, includeHashtags: value }))}
                        className={cn(
                          "flex-1 rounded-md border py-2 text-sm font-medium transition-colors",
                          state.includeHashtags === value ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                        )}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!canGenerate}
              onClick={() => setState(p => ({ ...p, generated: true }))}
            >
              <Sparkles className="h-4 w-4" />
              Generate Captions
            </Button>
          </div>

          {/* Right - Output */}
          <div className="space-y-4">
            {state.generated ? (
              <>
                <h2 className="text-lg font-semibold text-foreground">Generated Captions</h2>
                {captions.map((caption, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-sm">{caption.label}</CardTitle>
                          <CardDescription className="text-xs">{caption.style}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleCopy(caption.text, idx)}
                        >
                          {copiedIdx === idx ? (
                            <><CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
                          ) : (
                            <><Copy className="h-3.5 w-3.5" /> Copy</>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {caption.text}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Your captions will appear here</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Fill in the brief and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
