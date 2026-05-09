import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Users,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const platformBreakdown = [
  { platform: "Instagram", reach: "32.4k", engagement: "4.8%", posts: 24, trend: "up" },
  { platform: "Facebook", reach: "18.1k", engagement: "2.3%", posts: 18, trend: "down" },
  { platform: "Twitter / X", reach: "9.7k", engagement: "1.9%", posts: 41, trend: "up" },
  { platform: "LinkedIn", reach: "5.2k", engagement: "6.1%", posts: 9, trend: "up" },
];

const topContent = [
  { title: "Product Launch Teaser Reel", platform: "Instagram", views: "12.4k", engagement: "8.2%" },
  { title: "Behind-The-Scenes Story Set", platform: "Instagram", views: "9.8k", engagement: "6.7%" },
  { title: "Industry Insight Thread", platform: "Twitter / X", views: "7.1k", engagement: "5.4%" },
  { title: "Team Spotlight Post", platform: "LinkedIn", views: "4.3k", engagement: "9.1%" },
  { title: "Weekly Tips Carousel", platform: "Instagram", views: "3.9k", engagement: "4.8%" },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Analytics"
        description="Track performance metrics across all your content channels."
      >
        <Button variant="outline" size="sm">Export Report</Button>
        <Button size="sm">
          <BarChart2 className="mr-2 h-4 w-4" />
          Customize View
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Reach"
            value="65.4k"
            change="12.3%"
            positive
            icon={Eye}
            iconColor="text-violet-400"
          />
          <StatCard
            title="Total Engagements"
            value="8,920"
            change="5.7%"
            positive
            icon={Activity}
            iconColor="text-sky-400"
          />
          <StatCard
            title="Click-through Rate"
            value="3.2%"
            change="0.4%"
            positive={false}
            icon={MousePointerClick}
            iconColor="text-amber-400"
          />
          <StatCard
            title="New Followers"
            value="+1,240"
            change="18.9%"
            positive
            icon={Users}
            iconColor="text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chart Placeholder */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Performance Overview</CardTitle>
              <CardDescription>Reach and engagement across all platforms — last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-border">
                <div className="text-center">
                  <BarChart2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">Multi-platform chart will render here</p>
                  <p className="text-xs text-muted-foreground/60">Connect analytics sources to display data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Breakdown</CardTitle>
              <CardDescription>Performance per channel this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {platformBreakdown.map((row) => (
                  <div key={row.platform} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{row.platform}</p>
                      <p className="text-xs text-muted-foreground">{row.posts} posts published</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{row.reach}</p>
                      <p className="flex items-center justify-end gap-1 text-xs">
                        {row.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={row.trend === "up" ? "text-emerald-400" : "text-red-400"}>
                          {row.engagement}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Content</CardTitle>
              <CardDescription>Highest engagement posts this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {topContent.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">{item.views}</p>
                      <p className="text-xs text-emerald-400">{item.engagement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
