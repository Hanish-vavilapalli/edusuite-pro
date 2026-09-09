import { createFileRoute } from "@tanstack/react-router";
import { HodDashboard } from "@/components/dashboard/role/hod-dashboard";

export const Route = createFileRoute("/hod/dashboard")({
  head: () => ({
    meta: [{ title: "HOD Dashboard — EduSuite Pro" }],
  }),
  component: HodDashboard,
});
