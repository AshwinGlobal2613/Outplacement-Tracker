"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Loader2, RefreshCw, Linkedin, Twitter, Instagram, Mail, Facebook } from "lucide-react";

type Platform = "LinkedIn" | "Twitter/X" | "Instagram" | "Email" | "Facebook";

const platformIcons: Record<Platform, React.ElementType> = {
  LinkedIn: Linkedin,
  "Twitter/X": Twitter,
  Instagram: Instagram,
  Email: Mail,
  Facebook: Facebook,
};

const platformColors: Record<Platform, string> = {
  LinkedIn: "bg-sky-500/20 text-sky-300",
  "Twitter/X": "bg-zinc-500/20 text-zinc-300",
  Instagram: "bg-pink-500/20 text-pink-300",
  Email: "bg-amber-500/20 text-amber-300",
  Facebook: "bg-blue-500/20 text-blue-300",
};

const mockContent: Record<Platform, string> = {
  LinkedIn: `Most businesses are creating content backwards.

They start with the format — "let's do a reel" or "let's write a thread" — and then scramble for something worth saying.

The brands winning at content in 2024 do the opposite. They start with a strong point of view, then let the platform dictate the format.

Here's what that looks like in practice:

1. Define your core message first. What's the one thing you want your audience to believe, feel, or do differently after consuming your content?

2. Build a content pillar system. Every piece of content should map back to one of 3-5 core themes that reinforce your brand positioning.

3. Let the content breathe. Not every post needs a CTA. Some of your best-performing content will simply make people think.

The brands that grow aren't the ones publishing the most. They're the ones with the clearest point of view.

What's your brand's core perspective that no one else is saying?`,

  "Twitter/X": `Thread 🧵

1/ Most businesses are creating content backwards — and it's costing them followers, leads, and trust.

2/ They start with the format ("let's do a reel!") instead of starting with a point of view. Here's how to fix it:

3/ Step 1: Define your core message. What's the ONE thing you want your audience to believe after reading your content?

4/ Step 2: Build content pillars. Map every piece of content to 3-5 themes that reinforce your brand positioning.

5/ Step 3: Stop chasing trends. Post content that reflects your worldview, not just what's trending.

6/ The brands that compound growth aren't posting the most — they have the clearest perspective.

7/ Follow for more brand and content strategy you won't find in a course. 🔁 Repost if this was useful.`,

  Instagram: `Stop creating content backwards. 🛑

Most brands start with the FORMAT ("let's post a reel today!") instead of starting with a POINT OF VIEW.

The result? Generic content that blends into the feed and gets ignored.

Here's the fix:
✅ Start with your core message
✅ Build content pillars around your brand's worldview
✅ Create content that makes people think — not just scroll

The brands winning right now aren't posting the most. They're posting with the most clarity.

What's your brand's perspective that no one else is sharing? Drop it below 👇

#ContentStrategy #BrandBuilding #MarketingTips #ContentMarketing #SocialMediaMarketing #BrandStrategy #DigitalMarketing #ContentCreation #MarketingStrategy #GrowthMarketing #BrandPositioning #CreativeStrategy #ContentTips #MarketingMindset #BusinessGrowth`,

  Email: `Subject: Why your content isn't converting (it's not what you think)

Hey [First Name],

Most businesses I talk to are creating content backwards.

They start with the format — "we need a reel this week" — and then scramble to fill it with something worth saying.

The result? Content that looks busy but builds nothing.

The brands winning at content right now do the opposite. They start with a strong point of view, then let the platform and format follow.

Here's a simple framework to get unstuck:

1. Clarify your ONE core message — what do you want your audience to believe differently?
2. Map that message to 3-5 content pillars that reinforce your brand positioning
3. Create from conviction, not from trends

Your audience isn't looking for more content. They're looking for a perspective they can trust.

Hit reply and tell me — what's the one thing your brand believes that most people in your industry won't say?

Talk soon,
[Your Name]`,

  Facebook: `Here's something most businesses won't admit about their content strategy:

They're creating backwards.

Instead of starting with a strong point of view, they start with the format. "We need a post today" — and then scramble to fill it with something meaningful.

The brands that actually build loyal audiences? They start with a perspective. Something they genuinely believe. Something specific to them.

And then the content writes itself.

What would change for your business if every piece of content started with your brand's unique worldview instead of a random topic idea?

Share your thoughts in the comments. Would love to hear how you approach content planning.`,
};

export default function ContentRepurposePage() {
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [generated, setGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  const allPlatforms: Platform[] = ["LinkedIn", "Twitter/X", "Instagram", "Email", "Facebook"];

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleRepurpose = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setGenerated(true);
    }, 1500);
  };

  const handleCopy = (platform: Platform) => {
    navigator.clipboard.writeText(mockContent[platform]).catch(() => {});
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
  };

  const canGenerate = content.trim().length > 20 && selectedPlatforms.length > 0;

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Content Repurposer"
        description="Turn one piece of content into platform-optimized posts for every channel."
      />

      <div className="flex-1 p-6">
        <div className={cn("grid gap-6", generated ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-2xl mx-auto")}>
          {/* Left Panel - Input */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select content type...</option>
                    <option value="blog">Blog Post</option>
                    <option value="podcast">Podcast Transcript</option>
                    <option value="video">Video Script</option>
                    <option value="interview">Interview</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Paste Your Content</label>
                  <textarea
                    rows={10}
                    className="min-h-48 w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Paste your blog post, podcast transcript, video script, or any long-form content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <p className="text-right text-xs text-muted-foreground">{content.length} characters</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allPlatforms.map((p) => {
                    const Icon = platformIcons[p];
                    const isSelected = selectedPlatforms.includes(p);
                    return (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                          isSelected
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {p}
                      </button>
                    );
                  })}
                </div>
                {selectedPlatforms.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">Select at least one platform to continue.</p>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!canGenerate || isLoading}
              onClick={handleRepurpose}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Repurposing your content...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Repurpose Content
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Output */}
          {generated && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Generated Content</h2>
              {selectedPlatforms.map((platform) => {
                const Icon = platformIcons[platform];
                const colorClass = platformColors[platform];
                const isCopied = copiedPlatform === platform;
                return (
                  <Card key={platform}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", colorClass)}>
                            <Icon className="h-3 w-3" />
                            {platform}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleCopy(platform)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {isCopied ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                        {mockContent[platform]}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
