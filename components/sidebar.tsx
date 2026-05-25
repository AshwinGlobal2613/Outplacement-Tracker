"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Search,
  ShieldCheck,
  UserCircle2,
  LogOut,
  CalendarDays,
  BookOpen,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  sectionLabel: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    sectionLabel: "OUTPLACEMENT",
    items: [
      { label: "Overview", href: "/outplacement", icon: LayoutDashboard },
      { label: "My Dashboard", href: "/outplacement/my-dashboard", icon: UserCircle2 },
      { label: "Candidates", href: "/outplacement/candidates", icon: Users },
      { label: "Sessions", href: "/outplacement/sessions", icon: CalendarDays },
      { label: "Headhunters", href: "/outplacement/headhunters", icon: Search },
      { label: "Resources", href: "/outplacement/resources", icon: BookOpen },
    ],
  },
];

const adminNavItems: NavItem[] = [
  { label: "Admin Panel", href: "/outplacement/admin", icon: ShieldCheck },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        // Mobile: fixed overlay, slides in/out
        "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        // Desktop: always visible, static
        "lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo + mobile close button */}
      <div className="flex h-16 items-center justify-between px-5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">Outplacement</p>
          <p className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Management System</p>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col">
          {navSections.map((section, sectionIdx) => (
            <div key={section.sectionLabel} className={cn("flex flex-col", sectionIdx > 0 && "mt-2")}>
              <p className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.sectionLabel}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/outplacement"
                      ? pathname === "/outplacement"
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} style={!isActive ? { color: "#ffffff" } : {}} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Admin section */}
      {isAdmin && (
        <>
          <Separator className="bg-sidebar-border" />
          <div className="px-3 py-2">
            <p className="mb-1 px-3 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Admin
            </p>
            <div className="flex flex-col gap-0.5">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} style={!isActive ? { color: "#ffffff" } : {}} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* User footer */}
      <Separator className="bg-sidebar-border" />
      <div className="px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {session?.user?.name ?? "Guest"}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {session?.user?.role === "admin" ? "Admin" : "Team Member"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
