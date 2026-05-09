export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[420px] lg:flex-col lg:justify-between bg-sidebar border-r border-sidebar-border p-10">
        {/* Brand name */}
        <div>
          <p className="text-xl font-bold text-sidebar-foreground leading-tight">Outplacement</p>
          <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">Management System</p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              Outplacement Management System
            </h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Manage your entire outplacement program — from candidate tracking to placement milestones — in one secure platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: "👥", text: "Track every candidate's journey" },
              { icon: "📊", text: "Real-time progress dashboards" },
              { icon: "🔔", text: "Team notifications and activity logs" },
              { icon: "🔒", text: "Role-based secure access" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground/60">© 2026 Global · Outplacement Management System</p>
      </div>

      {/* Right content panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
