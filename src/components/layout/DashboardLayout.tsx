import { Sidebar } from "./Sidebar";
import { QuickActions } from "./QuickActions";
import { getSession } from "@/lib/auth";

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const role = session?.role || "admin";

  return (
    <div className="min-h-screen">
      <Sidebar role={role} />
      <main className="lg:pl-64">
        <div className="px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pt-18 lg:pt-4 max-w-7xl">
          {children}
        </div>
      </main>
      <QuickActions />
    </div>
  );
}
