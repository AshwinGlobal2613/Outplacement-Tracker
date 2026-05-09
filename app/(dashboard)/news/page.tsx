import {
  Newspaper,
  ExternalLink,
  Clock,
  Tag,
  RefreshCw,
  BookmarkPlus,
  TrendingUp,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const newsItems = [
  {
    id: 1,
    title: "Instagram Rolls Out New Creator Analytics Dashboard for Business Accounts",
    source: "Social Media Today",
    category: "Platform Updates",
    time: "2 hours ago",
    summary:
      "Instagram has launched an upgraded analytics suite offering creators deeper insights into audience demographics, content reach, and monetization performance.",
    tags: ["Instagram", "Analytics", "Creators"],
    trending: true,
  },
  {
    id: 2,
    title: "Short-Form Video Continues to Dominate Content Consumption in 2026",
    source: "Content Marketing Institute",
    category: "Industry Trends",
    time: "5 hours ago",
    summary:
      "A new report confirms that short-form video content generates 3x more engagement than static posts, with Reels and TikTok leading the charge.",
    tags: ["Video", "Trends", "Engagement"],
    trending: true,
  },
  {
    id: 3,
    title: "LinkedIn Expands Creator Mode with New Newsletter Features",
    source: "TechCrunch",
    category: "Platform Updates",
    time: "Yesterday",
    summary:
      "LinkedIn's latest update brings enhanced newsletter tools, allowing creators to build dedicated subscriber bases directly within the platform.",
    tags: ["LinkedIn", "Newsletters", "B2B"],
    trending: false,
  },
  {
    id: 4,
    title: "AI-Powered Content Scheduling Tools See 40% Adoption Surge Among SMBs",
    source: "Marketing Week",
    category: "AI & Technology",
    time: "Yesterday",
    summary:
      "Small and medium-sized businesses are rapidly adopting AI scheduling and content generation tools to keep up with growing publishing demands.",
    tags: ["AI", "Scheduling", "SMB"],
    trending: false,
  },
  {
    id: 5,
    title: "Brand Safety Concerns Rise as Social Platforms Update Content Policies",
    source: "Adweek",
    category: "Brand Safety",
    time: "2 days ago",
    summary:
      "Marketers are navigating new content policy changes across major platforms, with brand safety tools becoming an essential part of any social strategy.",
    tags: ["Brand Safety", "Policy", "Marketing"],
    trending: false,
  },
  {
    id: 6,
    title: "User-Generated Content Drives 29% Higher Conversion Rates, Study Finds",
    source: "HubSpot Research",
    category: "Strategy",
    time: "3 days ago",
    summary:
      "Brands leveraging UGC in their content strategy see significantly higher conversion rates compared to brand-only content, according to a new HubSpot study.",
    tags: ["UGC", "Conversion", "Strategy"],
    trending: false,
  },
];

const categories = [
  { name: "All", count: 24 },
  { name: "Platform Updates", count: 8 },
  { name: "Industry Trends", count: 6 },
  { name: "AI & Technology", count: 4 },
  { name: "Strategy", count: 3 },
  { name: "Brand Safety", count: 3 },
];

const categoryColors: Record<string, string> = {
  "Platform Updates": "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "Industry Trends": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  "AI & Technology": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "Brand Safety": "bg-red-500/15 text-red-400 border-red-500/30",
  "Strategy": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function NewsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="News Consolidator"
        description="Stay current with the latest social media and content marketing news."
      >
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter Sources
        </Button>
        <Button size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Feed
        </Button>
      </PageHeader>

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Category Filter Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 pb-4">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                      cat.name === "All"
                        ? "bg-primary/15 font-medium text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      {cat.count}
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pb-4">
                {["Reels", "AI Tools", "Creator Economy", "Short-form", "Analytics", "UGC", "B2B Content"].map(
                  (tag) => (
                    <button
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </button>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* News Feed */}
          <div className="flex flex-col gap-4 lg:col-span-3">
            {newsItems.map((item) => (
              <Card
                key={item.id}
                className="transition-colors hover:border-primary/50"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            categoryColors[item.category] ||
                            "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                          }`}
                        >
                          {item.category}
                        </span>
                        {item.trending && (
                          <span className="flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
                            <TrendingUp className="h-3 w-3" /> Trending
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {item.time}
                        </span>
                      </div>
                      <h3 className="mb-1.5 text-sm font-semibold leading-snug text-foreground">
                        {item.title}
                      </h3>
                      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                        {item.summary}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.source}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <BookmarkPlus className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full">
              Load More Articles
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
