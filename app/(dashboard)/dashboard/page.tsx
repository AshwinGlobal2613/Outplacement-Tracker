import Link from "next/link";
import {
  Users,
  Megaphone,
  FileText,
  TrendingUp,
  ClipboardCheck,
  Compass,
  RefreshCw,
  MessageSquare,
  Kanban,
  ArrowRight,
  CheckCircle2,
  PlusCircle,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  {
    icon: ClipboardCheck,
    title: "Brand Scorecard",
    description: "Audit your brand across 10 key dimensions and get an actionable improvement plan.",
    href: "/brand-scorecard",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    icon: Compass,
    title: "Positioning Wizard",
    description: "Define your unique market position with a guided 5-step framework.",
    href: "/positioning-wizard",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    icon: Users,
    title: "ICP Builder",
    description: "Build a detailed ideal customer profile with demographics, goals, and buying behavior.",
    href: "/icp-builder",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    icon: RefreshCw,
    title: "Content Repurposer",
    description: "Turn one piece of content into posts optimized for every platform.",
    href: "/content-repurpose",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
  {
    icon: MessageSquare,
    title: "Caption Writer",
    description: "Generate on-brand captions trained on your own voice and brief.",
    href: "/caption-writer",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
  },
  {
    icon: Kanban,
    title: "CRM Pipeline",
    description: "Manage deals from lead to close with a visual kanban pipeline.",
    href: "/crm",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
];

const recentActivity = [
  {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    text: "Brand scorecard completed for Acme Corp — scored 78/100 (Strong Foundation)",
    time: "2 hours ago",
  },
  {
    icon: PlusCircle,
    iconColor: "text-sky-400",
    text: "New deal added to pipeline: TechStart Inc — $12,000 (Qualified)",
    time: "4 hours ago",
  },
  {
    icon: Sparkles,
    iconColor: "text-violet-400",
    text: "3 captions generated for @brandname using Playful tone",
    time: "6 hours ago",
  },
  {
    icon: RefreshCw,
    iconColor: "text-amber-400",
    text: "Blog post repurposed into 4 platform formats (LinkedIn, Twitter, Instagram, Email)",
    time: "Yesterday",
  },
  {
    icon: Compass,
    iconColor: "text-pink-400",
    text: "Positioning document created for NovaTech Solutions",
    time: "Yesterday",
  },
  {
    icon: FileText,
    iconColor: "text-orange-400",
    text: "ICP profile generated: 'The Growth-Focused VP at a Series B Company'",
    time: "2 days ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="ElevateHub Platform"
        description="Your all-in-one brand, content, and growth command center"
      />

      <div className="flex-1 space-y-8 p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active Clients"
            value="24"
            change="3 from last month"
            positive
            icon={Users}
            iconColor="text-violet-400"
          />
          <StatCard
            title="Campaigns Running"
            value="8"
            change="2 from last month"
            positive
            icon={Megaphone}
            iconColor="text-sky-400"
          />
          <StatCard
            title="Content Pieces"
            value="142"
            change="28 from last month"
            positive
            icon={FileText}
            iconColor="text-emerald-400"
          />
          <StatCard
            title="Avg. Engagement"
            value="4.8%"
            change="0.6% from last month"
            positive
            icon={TrendingUp}
            iconColor="text-amber-400"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card className="group cursor-pointer transition-colors hover:border-primary/50 hover:bg-card/80">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.bg}`}>
                            <Icon className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{action.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 px-6 py-4">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card">
                        <Icon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.text}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
