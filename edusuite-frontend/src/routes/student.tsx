import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useRole } from "@/context/role-context";
import { normalizeRole } from "@/lib/roleResolver";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/student")({
  component: StudentLayout,
});

function StudentLayout() {
  const { role } = useRole();
  const normalized = normalizeRole(role);
  const hasStudentToken = typeof window !== "undefined" && Boolean(localStorage.getItem("student_token") || localStorage.getItem("token"));

  if (!hasStudentToken && normalized !== "student" && normalized !== "super_admin" && normalized !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-slate-950 text-white">
        <div className="text-center max-w-md border border-red-500/20 bg-slate-900 rounded-2xl p-6 shadow-2xl">
          <ShieldAlert className="size-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Student Portal Authentication Required</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Please log in with your Student ID and credentials to access your personalized hostel dashboard.
          </p>
          <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
            <Link to="/student/login">Go to Student Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
