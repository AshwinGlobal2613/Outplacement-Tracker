"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Zap, LogOut, Bell, X, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type PortalNotification = {
  id: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};

function NotificationBell() {
  const [notifs, setNotifs] = useState<PortalNotification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function fetchNotifs() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setNotifs(await res.json());
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllRead" }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function fmtTime(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return "just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) markAllRead(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            <div className="flex items-center gap-1">
              {notifs.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifs.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "px-4 py-3 transition-colors",
                    !n.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    <div className={cn("flex-1 min-w-0", n.read && "ml-3.5")}>
                      <p className="text-xs text-foreground leading-snug">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{fmtTime(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "client" && role !== "candidate") router.push("/outplacement");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const displayName =
    session.user.role === "candidate"
      ? session.user.name
      : (session.user.clientCompany ?? "Client Portal");

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Logo + name */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-foreground">{displayName}</p>
              <p className="text-[10px] leading-tight text-muted-foreground tracking-wide uppercase">
                Outplacement Portal
              </p>
            </div>
          </div>

          {/* Right side: notifications + user + sign out */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">{session.user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
