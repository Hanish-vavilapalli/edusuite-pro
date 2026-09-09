import { createFileRoute, Outlet, useLocation, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useRole } from "@/context/role-context";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/hostel")({
  head: () => ({ meta: [{ title: "Hostel Management — EduSuite Pro" }] }),
  component: HostelLayout,
});

function HostelLayout() {
  const location = useLocation();
  const isRegistration = location.pathname.includes("/registration");
  const { role, flags } = useRole();
  const isHod = role === "hod" || flags.includes("isHod");
  const isHostelAdmin = flags.includes("isHostelWarden") || role === "warden" || role === "super-admin" || role === "super_admin";

  if (isHod && !isHostelAdmin) {
    return (
      <DashboardLayout hideTopbar={true}>
        <div className="flex h-[70vh] items-center justify-center p-4">
          <div className="text-center max-w-md border border-destructive/20 bg-destructive/5 rounded-2xl p-6">
            <ShieldAlert className="size-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-bold">403 — Unauthorized Access</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              The HOD role is not authorized to access the Hostel Management module.
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/hod/dashboard">Return to HOD Dashboard</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isRegistration) {
    return <Outlet />;
  }

  return (
    <DashboardLayout hideTopbar={true}>
      <Outlet />
    </DashboardLayout>
  );
}

