import type { ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { Topbar } from "@/components/dashboard/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { brand } from "@/config/branding";
import { useRole } from "@/context/role-context";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile } = useRole();
  const showAi = profile.featureFlags?.["aiAssistant"] !== false;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <Topbar />
          <main className="animate-fade-in-soft flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 overflow-x-hidden">{children}</main>
          <footer className="border-t border-border px-3 py-4 text-xs text-muted-foreground sm:px-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
              </span>
              <span>Academic Year 2024-25 &middot; Multi-campus SaaS</span>
            </div>
          </footer>
        </div>
        {showAi && <AiAssistant />}
      </div>
    </SidebarProvider>
  );
}
