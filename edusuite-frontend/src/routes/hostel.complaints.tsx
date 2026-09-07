import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/complaints")({
  head: () => ({ meta: [{ title: "Hostel Complaints — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
