import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useRole } from "@/context/role-context";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/examinations")({
  head: () => ({ meta: [{ title: "Examinations & Evaluation — EduSuite Pro" }] }),
  component: ExaminationsLayout,
});

export function ExaminationsLayout() {
  const { role } = useRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
