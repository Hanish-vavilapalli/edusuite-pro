import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/rooms")({
  head: () => ({ meta: [{ title: "Hostel Rooms — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
