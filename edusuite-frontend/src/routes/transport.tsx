import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TransportModuleView } from "@/modules/transport";
import { useRole } from "@/context/role-context";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/transport")({
  head: () => ({ meta: [{ title: "Campus Transport — EduSuite Pro" }] }),
  component: TransportPage,
});

function TransportPage() {
  const { role, flags } = useRole();
  const isHod = role === "hod" || flags.includes("isHod");
  const isTransportAdmin = flags.includes("isTransportOfficer") || role === "transport" || role === "super-admin" || role === "super_admin";

  if (isHod && !isTransportAdmin) {
    return (
      <DashboardLayout>
        <div className="flex h-[70vh] items-center justify-center p-4">
          <div className="text-center max-w-md border border-destructive/20 bg-destructive/5 rounded-2xl p-6">
            <ShieldAlert className="size-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-bold">403 — Unauthorized Access</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              The HOD role is not authorized to access the Campus Transport module.
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/hod/dashboard">Return to HOD Dashboard</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <TransportModuleView />
    </DashboardLayout>
  );
}

