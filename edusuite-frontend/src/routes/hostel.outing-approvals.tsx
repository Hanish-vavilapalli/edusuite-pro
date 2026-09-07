import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/outing-approvals")({
  head: () => ({ meta: [{ title: "Hostel Outing Approvals — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
