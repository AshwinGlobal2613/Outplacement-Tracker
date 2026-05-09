import {
  Crosshair,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Plus,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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

const competitors = [
  {
    name: "BrandAlpha",
    handle: "@brandalpha",
    followers: "124k",
    engagement: "5.2%",
    postsPerWeek: 9,
    followerGrowth: "+2.1%",
    growthDirection: "up",
    lastPost: "3 hours ago",
    topContent: "Behind-the-scenes reels",
  },
  {
    name: "NovaCo",
    handle: "@novaco_official",
    followers: "89.3k",
    engagement: "3.8%",
    postsPerWeek: 6,
    followerGrowth: "-0.4%",
    growthDirection: "down",
    lastPost: "1 day ago",
    topContent: "Product showcase carousels",
  },
  {
    name: "PeakBrand",
    handle: "@peakbrand",
    followers: "57.1k",
    engagement: "7.1%",
    postsPerWeek: 14,
    followerGrowth: "+4.8%",
    growthDirection: "up",
    lastPost: "5 hours ago",
    topContent: "Educational infographics",
  },
  {
    name: "CoreMedia",
    handle: "@coremedia_hq",
    followers: "31.6k",
    engagement: "2.9%",
    postsPerWeek: 4,
    followerGrowth: "+0.2%",
    growthDirection: "neutral",
    lastPost: "2 days ago",
    topContent: "User-generated content reposts",
  },
];

const insights = [
  {
    title: "BrandAlpha increased posting frequency by 30%",
    impact: "High",
    time: "This week",
    color: "text-red-400",
    bg: "bg-red-400/10",
  },
  {
    title: "PeakBrand's infographic series driving 3x engagement",
    impact: "Medium",
    time: "Last 7 days",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    title: "NovaCo lost 400 followers after product controversy",
    impact: "Opportunity",
    time: "This week",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
];

export default function CompetitorTrackerPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Competitor Tracker"
        description="Monitor competitor activity, growth trends, and content strategies."
      >
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Competitor
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              <p className="mt-1 text-3xl font-bold text-foreground">4</p>
              <p className="mt-1 text-xs text-muted-foreground">Across Instagram</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg. Competitor Engagement</p>
              <p className="mt-1 text-3xl font-bold text-foreground">4.75%</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" /> Your rate: 4.8% (leading)
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg. Posts Per Week</p>
              <p className="mt-1 text-3xl font-bold text-foreground">8.25</p>
              <p className="mt-1 text-xs text-muted-foreground">Your rate: 7 posts/week</p>
            </CardContent>
          </Card>
        </div>

        {/* Competitor Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competitor Overview</CardTitle>
            <CardDescription>Live metrics from tracked accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Account</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Followers</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Engagement</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Posts/Week</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Growth</th>
                    <th className="pb-3 pr-4 font-medium text-muted-foreground">Last Post</th>
                    <th className="pb-3 font-medium text-muted-foreground">Top Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {competitors.map((c) => (
                    <tr key={c.name} className="group">
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.handle}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-foreground">{c.followers}</td>
                      <td className="py-3 pr-4">
                        <span className="font-medium text-emerald-400">{c.engagement}</span>
                      </td>
                      <td className="py-3 pr-4 text-foreground">{c.postsPerWeek}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            c.growthDirection === "up"
                              ? "text-emerald-400"
                              : c.growthDirection === "down"
                              ? "text-red-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {c.growthDirection === "up" && <ArrowUpRight className="h-3 w-3" />}
                          {c.growthDirection === "down" && <ArrowDownRight className="h-3 w-3" />}
                          {c.growthDirection === "neutral" && <Minus className="h-3 w-3" />}
                          {c.followerGrowth}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{c.lastPost}</td>
                      <td className="py-3 text-muted-foreground">{c.topContent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Competitive Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Competitive Insights</CardTitle>
            <CardDescription>Notable activity and opportunities detected this week</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {insights.map((insight, i) => (
              <div key={i} className={`flex items-start gap-4 rounded-lg p-4 ${insight.bg}`}>
                <Crosshair className={`mt-0.5 h-4 w-4 shrink-0 ${insight.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{insight.time}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border border-current px-2 py-0.5 text-xs font-medium ${insight.color}`}
                >
                  {insight.impact}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
