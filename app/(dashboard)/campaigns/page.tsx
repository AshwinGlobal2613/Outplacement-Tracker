import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const campaigns = [
  {
    name: "Spring Brand Awareness",
    platform: "Meta",
    spend: "$4,200",
    revenue: "$22,800",
    roas: "5.43x",
    leads: 182,
    status: "Active",
  },
  {
    name: "Google Search — High Intent",
    platform: "Google",
    spend: "$6,800",
    revenue: "$38,500",
    roas: "5.66x",
    leads: 310,
    status: "Active",
  },
  {
    name: "LinkedIn Lead Gen Q2",
    platform: "LinkedIn",
    spend: "$3,500",
    revenue: "$14,200",
    roas: "4.06x",
    leads: 95,
    status: "Active",
  },
  {
    name: "Email Nurture — Warm List",
    platform: "Email",
    spend: "$800",
    revenue: "$12,400",
    roas: "15.5x",
    leads: 148,
    status: "Paused",
  },
  {
    name: "TikTok Product Demo",
    platform: "TikTok",
    spend: "$3,100",
    revenue: "$6,300",
    roas: "2.03x",
    leads: 112,
    status: "Ended",
  },
];

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/20 text-emerald-400",
  Paused: "bg-amber-500/20 text-amber-400",
  Ended: "bg-zinc-500/20 text-zinc-400",
};

const platformStyles: Record<string, string> = {
  Meta: "bg-blue-500/20 text-blue-300",
  Google: "bg-sky-500/20 text-sky-300",
  LinkedIn: "bg-cyan-500/20 text-cyan-300",
  Email: "bg-amber-500/20 text-amber-300",
  TikTok: "bg-pink-500/20 text-pink-300",
};

export default function CampaignsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Campaign ROI"
        description="Track performance, spend, and revenue across all active campaigns."
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Top Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Ad Spend"
            value="$18,400"
            change="$2,100 vs last month"
            positive={false}
            icon={DollarSign}
            iconColor="text-red-400"
          />
          <StatCard
            title="Total Revenue"
            value="$94,200"
            change="$11,800 vs last month"
            positive
            icon={ShoppingCart}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Blended ROAS"
            value="5.12x"
            change="0.4x vs last month"
            positive
            icon={TrendingUp}
            iconColor="text-violet-400"
          />
          <StatCard
            title="Leads Generated"
            value="847"
            change="124 vs last month"
            positive
            icon={Users}
            iconColor="text-sky-400"
          />
        </div>

        {/* Campaign Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign Performance</CardTitle>
            <CardDescription>All campaigns — current period</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spend</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">ROAS</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Leads</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {campaigns.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${platformStyles[c.platform] ?? "bg-muted text-muted-foreground"}`}>
                          {c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">{c.spend}</td>
                      <td className="px-4 py-4 text-right font-semibold text-foreground">{c.revenue}</td>
                      <td className="px-4 py-4 text-right font-bold text-emerald-400">{c.roas}</td>
                      <td className="px-4 py-4 text-right text-foreground">{c.leads}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Performing Creative */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top Performing Creative</CardTitle>
              <CardDescription>Highest ROAS creative this period</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Pain Point Hook — V3", platform: "Meta", ctr: "4.8%", roas: "7.2x", impressions: "142k" },
                { name: "Founder Story Testimonial", platform: "LinkedIn", ctr: "3.1%", roas: "5.9x", impressions: "38k" },
                { name: "Product Demo 30s", platform: "Google", ctr: "6.2%", roas: "5.5x", impressions: "91k" },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{c.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${platformStyles[c.platform] ?? "bg-muted text-muted-foreground"}`}>{c.platform}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">{c.roas}</p>
                    <p className="text-xs text-muted-foreground">CTR {c.ctr} · {c.impressions} impressions</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimization Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-amber-400" />
                Optimization Insights
              </CardTitle>
              <CardDescription>AI-powered recommendations based on ROAS trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: "Shift budget from TikTok to Email",
                  detail: "TikTok ROAS (2.03x) is 75% below Email (15.5x). Reallocate 15% spend to Email Nurture to capture high-intent leads.",
                  color: "border-l-amber-500",
                },
                {
                  title: "Scale Google Search — High Intent",
                  detail: "Google campaign has highest lead volume (310) and strong ROAS (5.66x). Increase budget by 20% to capture remaining search demand.",
                  color: "border-l-emerald-500",
                },
                {
                  title: "Refresh Meta creative sets",
                  detail: "Meta CPM has increased 12% MoM suggesting ad fatigue. Launch 2-3 new creative variants in the next 7 days to maintain ROAS.",
                  color: "border-l-sky-500",
                },
              ].map((insight, idx) => (
                <div key={idx} className={`rounded-lg border border-border border-l-2 bg-card pl-4 pr-4 py-3 ${insight.color}`}>
                  <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
