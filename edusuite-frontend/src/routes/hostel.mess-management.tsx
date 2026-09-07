import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/mess-management")({
  head: () => ({ meta: [{ title: "Hostel Mess Management — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
