import {
  Instagram,
  Heart,
  MessageCircle,
  Users,
  TrendingUp,
  Image,
  Clock,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentPosts = [
  {
    id: 1,
    caption: "Behind the scenes of our latest shoot...",
    likes: "2.4k",
    comments: "138",
    status: "Published",
    date: "2 hours ago",
  },
  {
    id: 2,
    caption: "Exciting product launch coming soon! Stay tuned",
    likes: "—",
    comments: "—",
    status: "Scheduled",
    date: "Tomorrow 9:00 AM",
  },
  {
    id: 3,
    caption: "Our team working hard every single day 💪",
    likes: "1.1k",
    comments: "74",
    status: "Published",
    date: "3 days ago",
  },
  {
    id: 4,
    caption: "New collection dropping this Friday...",
    likes: "—",
    comments: "—",
    status: "Draft",
    date: "Not scheduled",
  },
];

const statusColors: Record<string, string> = {
  Published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function InstagramPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Instagram Manager"
        description="Manage posts, stories, and monitor engagement across your Instagram account."
      >
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Followers"
            value="48.2k"
            change="3.2%"
            positive
            icon={Users}
          />
          <StatCard
            title="Avg. Likes"
            value="1,840"
            change="7.1%"
            positive
            icon={Heart}
            iconColor="text-rose-400"
          />
          <StatCard
            title="Avg. Comments"
            value="126"
            change="2.4%"
            positive={false}
            icon={MessageCircle}
            iconColor="text-sky-400"
          />
          <StatCard
            title="Engagement Rate"
            value="4.8%"
            change="0.6%"
            positive
            icon={TrendingUp}
            iconColor="text-emerald-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Posts */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Posts</CardTitle>
                <CardDescription>Your latest Instagram activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Image className="mr-2 h-4 w-4" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center gap-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-purple-500 to-pink-500">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {post.caption}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {post.comments}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {post.date}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[post.status]}`}
                    >
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
              <CardDescription>Common tasks at a glance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="mr-2 h-4 w-4" /> Create New Post
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" /> Schedule Content
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Image className="mr-2 h-4 w-4" /> Upload Media
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" /> View Insights
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="mr-2 h-4 w-4" /> Manage Audience
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder Charts Area */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Over Time</CardTitle>
            <CardDescription>
              Likes, comments, and reach for the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border">
              <div className="text-center">
                <BarChart className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Chart will render here
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Connect your data source to display analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarChart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
