import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/blocks")({
  head: () => ({ meta: [{ title: "Hostel Blocks — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
