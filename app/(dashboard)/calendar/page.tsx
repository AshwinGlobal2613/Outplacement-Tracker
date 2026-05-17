import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Clock,
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

const scheduledPosts = [
  {
    id: 1,
    title: "Product Launch Teaser",
    platform: "Instagram",
    date: "Apr 2",
    time: "9:00 AM",
    status: "Scheduled",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 2,
    title: "Weekly Industry Tips",
    platform: "LinkedIn",
    date: "Apr 3",
    time: "11:30 AM",
    status: "Scheduled",
    color: "from-blue-600 to-blue-400",
  },
  {
    id: 3,
    title: "Behind-the-Scenes Reel",
    platform: "Instagram",
    date: "Apr 5",
    time: "2:00 PM",
    status: "Draft",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 4,
    title: "Community Q&A Thread",
    platform: "Twitter",
    date: "Apr 7",
    time: "3:00 PM",
    status: "Scheduled",
    color: "from-sky-500 to-sky-400",
  },
  {
    id: 5,
    title: "Customer Spotlight Feature",
    platform: "Facebook",
    date: "Apr 9",
    time: "10:00 AM",
    status: "Draft",
    color: "from-blue-500 to-indigo-500",
  },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const calendarDays = Array.from({ length: 35 }, (_, i) => {
  const day = i - 1;
  return day > 0 && day <= 30 ? day : null;
});

const postsPerDay: Record<number, number> = { 2: 1, 3: 1, 5: 1, 7: 1, 9: 1, 14: 2, 18: 1, 22: 1, 28: 1 };

const statusColors: Record<string, string> = {
  Scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export default function CalendarPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Content Calendar"
        description="Plan, schedule, and manage your content publishing pipeline."
      >
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Post
        </Button>
      </PageHeader>

      <div className="flex-1 space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">April 2026</CardTitle>
                <CardDescription>Click a day to view or add content</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {daysOfWeek.map((d) => (
                  <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`relative min-h-[52px] rounded-md border p-1.5 text-xs transition-colors ${
                      day === 1
                        ? "border-primary bg-primary/10"
                        : day
                        ? "border-border hover:border-primary/50 hover:bg-accent cursor-pointer"
                        : "border-transparent"
                    }`}
                  >
                    {day && (
                      <>
                        <span
                          className={`font-medium ${
                            day === 1 ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        {postsPerDay[day] && (
                          <div className="mt-1 flex flex-wrap gap-0.5">
                            {Array.from({ length: postsPerDay[day] }).map((_, j) => (
                              <span
                                key={j}
                                className="block h-1.5 w-1.5 rounded-full bg-primary"
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Scheduled */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Upcoming Posts</CardTitle>
              <CardDescription>Next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${post.color}`}
                  >
                    <CalendarDays className="h-4 w-4" style={{ color: "#ffffff" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.platform}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {post.date} · {post.time}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${statusColors[post.status]}`}
                  >
                    {post.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Platform Queue Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Queue Summary</CardTitle>
            <CardDescription>Posts queued per platform this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { name: "Instagram", count: 12, icon: Instagram, color: "text-pink-400", bg: "bg-pink-400/10" },
                { name: "LinkedIn", count: 6, icon: Linkedin, color: "text-blue-400", bg: "bg-blue-400/10" },
                { name: "Twitter", count: 9, icon: Twitter, color: "text-sky-400", bg: "bg-sky-400/10" },
                { name: "Facebook", count: 4, icon: Facebook, color: "text-indigo-400", bg: "bg-indigo-400/10" },
              ].map((p) => (
                <div key={p.name} className={`flex items-center gap-3 rounded-lg p-4 ${p.bg}`}>
                  <p.icon className={`h-6 w-6 ${p.color}`} />
                  <div>
                    <p className="text-lg font-bold text-foreground">{p.count}</p>
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
