import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
