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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ open = false, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        // Width: collapsed = 64px, expanded = 256px
        collapsed ? "w-16" : "w-64",
        // Mobile: fixed overlay, slides in/out
        "fixed inset-y-0 left-0 z-50",
        // Desktop: always visible, static
        "lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Header: logo + close (mobile) + collapse toggle (desktop) */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">Outplacement</p>
            <p className="text-[10px] text-muted-foreground leading-tight tracking-wide uppercase">Management System</p>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden lg:flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors",
            collapsed && "w-full"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        <nav className="flex flex-col gap-0.5 px-2">
          {navSections.map((section) => (
            <div key={section.sectionLabel} className="flex flex-col">
              {!collapsed && (
                <p className="mb-1 px-2 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.sectionLabel}
                </p>
              )}
              {collapsed && <div className="mb-1 mt-2 h-px bg-sidebar-border/40" />}
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
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-0" : "gap-3 px-3",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")}
                      style={!isActive ? { color: "#ffffff" } : {}}
                    />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Admin section */}
      {isAdmin && (
        <>
          <Separator className="bg-sidebar-border" />
          <div className="px-2 py-2">
            {!collapsed && (
              <p className="mb-1 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Admin
              </p>
            )}
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-md py-2 text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-0" : "gap-3 px-3",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")}
                    style={!isActive ? { color: "#ffffff" } : {}}
                  />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* User footer */}
      <Separator className="bg-sidebar-border" />
      <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
        <div className={cn(
          "flex items-center rounded-lg py-2",
          collapsed ? "justify-center" : "gap-3 px-2"
        )}>
          <div
            title={collapsed ? (session?.user?.name ?? "Guest") : undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary cursor-default"
          >
            {initials}
          </div>
          {!collapsed && (
            <>
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
            </>
          )}
          {collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign out"
              className="hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
