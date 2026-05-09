"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ClipboardList, UsersRound, Activity, ChevronRight } from "lucide-react";

const adminSections = [
  {
    title: "Candidate Management",
    description: "Billing, invoicing, DiSC status, and program tracking for all candidates.",
    href: "/outplacement/admin/candidate-management",
    icon: ClipboardList,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    title: "User Management",
    description: "Add, edit, enable or disable team members and manage admin roles.",
    href: "/outplacement/admin/users",
    icon: UsersRound,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    title: "Activity Log",
    description: "A full audit trail of all team actions on candidates and records.",
    href: "/outplacement/activity",
    icon: Activity,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

export default function AdminHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "admin") router.push("/outplacement");
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session?.user?.role !== "admin") return null;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Admin Panel"
        description="Manage candidates, users, and system activity — admin access only."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className={`group flex flex-col gap-4 rounded-xl border p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${section.border} ${section.bg}`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.bg} border ${section.border}`}>
                  <Icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <ChevronRight className={`h-5 w-5 ${section.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div>
                <h3 className={`text-base font-semibold ${section.color}`}>{section.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{section.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
