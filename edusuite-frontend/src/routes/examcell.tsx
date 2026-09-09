import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useRole } from "@/context/role-context";
import { normalizeRole } from "@/lib/roleResolver";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/examcell")({
  component: ExamcellLayout,
});

function ExamcellLayout() {
  const { role, flags } = useRole();
  const norm = normalizeRole(role);
  const isSuperAdmin = norm === "super_admin" || norm === "admin";

  const isAuthorized =
    isSuperAdmin ||
    norm === "exam_cell" ||
    norm === "dean" ||
    role === "staff" ||
    flags.includes("isExamController") ||
    flags.includes("isExamAssistant");

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-background">
        <div className="text-center max-w-md border border-destructive/20 bg-destructive/5 rounded-2xl p-6">
          <ShieldAlert className="size-10 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-bold">Access Denied</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            You need Exam Controller (Officer) or Assistant privileges to view this section.
          </p>
          <Button asChild className="rounded-xl">
            <Link to="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
