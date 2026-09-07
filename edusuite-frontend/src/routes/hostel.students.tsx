import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/students")({
  head: () => ({ meta: [{ title: "Hostel Students — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
