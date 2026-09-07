import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export const Route = createFileRoute("/hostel")({
  head: () => ({ meta: [{ title: "Hostel Management — EduSuite Pro" }] }),
  component: HostelLayout,
});

function HostelLayout() {
  const location = useLocation();
  const isRegistration = location.pathname.includes("/registration");

  if (isRegistration) {
    return <Outlet />;
  }

  return (
    <DashboardLayout hideTopbar={true}>
      <Outlet />
    </DashboardLayout>
  );
}
