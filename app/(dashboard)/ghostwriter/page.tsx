"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, CheckCheck, RefreshCw, PenTool, Eye, BookOpen } from "lucide-react";

type Tone = "Conversational" | "Professional" | "Bold" | "Vulnerable";

interface Answers {
  topic: string;
  perspective: string;
  story: string;
  takeaway: string;
  audience: string;
}

const questions: { key: keyof Answers; question: string; placeholder: string }[] = [
  {
    key: "topic",
    question: "1. What topic do you want to write about?",
    placeholder: "e.g. Why most content strategies fail before they start, The future of remote work, How I learned to delegate...",
  },
  {
    key: "perspective",
    question: "2. What's your unique perspective or contrarian take on it?",
    placeholder: "e.g. Most people think consistency is the key — I think clarity matters more. You can be consistent and consistently wrong...",
  },
  {
    key: "story",
    question: "3. Share a personal story or experience that relates to this topic.",
    placeholder: "e.g. Two years ago I was publishing 5 posts a week and getting zero traction. Then I reduced to 2 posts and my reach tripled...",
  },
  {
    key: "takeaway",
    question: "4. What's the one key takeaway you want your audience to walk away with?",
    placeholder: "e.g. Stop optimizing for volume. Optimize for impact. One post that resonates beats ten that blend in...",
  },
  {
    key: "audience",
    question: "5. Who is your audience? (their role, industry, biggest challenge)",
    placeholder: "e.g. Founders and marketing leaders at B2B startups who are struggling to build a content engine without a big team...",
  },
];

const tones: Tone[] = ["Conversational", "Professional", "Bold", "Vulnerable"];

function generatePost(answers: Answers, tone: Tone): string {
  const topic = answers.topic || "this topic";
  const perspective = answers.perspective || "a fresh perspective";
  const story = answers.story || "a personal experience";
  const takeaway = answers.takeaway || "a key lesson";
  const audience = answers.audience || "professionals in this space";

  const toneIntro: Record<Tone, string> = {
    Conversational: "Let me tell you something that took me way too long to figure out.",
    Professional: "After years in this industry, one insight has consistently separated thriving teams from struggling ones.",
    Bold: "Unpopular opinion: everything you've been told about " + topic.split(" ").slice(0, 4).join(" ") + " is incomplete.",
    Vulnerable: "I'm going to share something I haven't talked about publicly before.",
  };

  return `${toneIntro[tone]}

${perspective}

Here's the story:

${story}

That experience changed how I think about ${topic.split(" ").slice(0, 6).join(" ")} entirely.

Most people in ${audience.split(" ").slice(0, 5).join(" ")} are approaching this the same way — optimizing for the wrong things, measuring the wrong metrics, and wondering why the results don't match the effort.

The shift I'd encourage you to make:

Stop thinking about ${topic.split(" ").slice(0, 4).join(" ")} as a tactic. Start thinking about it as a reflection of how clearly you understand your audience.

When you get that right, everything else — the format, the frequency, the distribution — becomes secondary.

${takeaway}

That's the real unlock.

The people I've seen grow fastest in this space aren't the ones with the biggest budgets or the most polished content. They're the ones who understand their audience deeply and speak to them without flinching.

If you're ${audience.split(" ").slice(0, 4).join(" ")}, I'd love to hear how you're approaching this differently.

What's one assumption about ${topic.split(" ").slice(0, 3).join(" ")} you've had to unlearn?`;
}

export default function GhostwriterPage() {
  const [answers, setAnswers] = useState<Answers>({
    topic: "", perspective: "", story: "", takeaway: "", audience: "",
  });
  const [tone, setTone] = useState<Tone>("Conversational");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const post = generatePost(answers, tone);
  const canGenerate = answers.topic.trim().length > 5 && answers.perspective.trim().length > 5;

  const handleCopy = () => {
    navigator.clipboard.writeText(post).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setGenerated(false);
    setTimeout(() => setGenerated(true), 100);
  };

  const textareaClass = "w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex flex-col">
      <PageHeader
        title="LinkedIn Ghostwriter"
        description="Turn your ideas, stories, and perspectives into compelling LinkedIn posts."
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left - Input */}
          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Story & Perspective</CardTitle>
                <CardDescription>Answer these 5 questions to generate your post.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {questions.map(({ key, question, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">{question}</label>
                    <textarea
                      rows={3}
                      className={textareaClass}
                      placeholder={placeholder}
                      value={answers[key]}
                      onChange={(e) => setAnswers(p => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tone of Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        "rounded-lg border py-2.5 text-sm font-medium transition-colors",
                        tone === t ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      )}
                    >{t}</button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!canGenerate}
              onClick={() => setGenerated(true)}
            >
              <PenTool className="h-4 w-4" />
              Generate Post
            </Button>
          </div>

          {/* Right - Output */}
          <div className="space-y-4">
            {generated ? (
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">Your LinkedIn Post</CardTitle>
                      <CardDescription className="mt-0.5">Tone: {tone}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleRegenerate}>
                        <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={handleCopy}>
                        {copied ? <><CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-300">
                      <Eye className="h-3 w-3" />
                      1,200 – 4,500 impressions
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                      <BookOpen className="h-3 w-3" />
                      8th Grade Readability
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Hook</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{post}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-border">
                <div className="text-center">
                  <PenTool className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Your post will appear here</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Answer the questions and click Generate</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
