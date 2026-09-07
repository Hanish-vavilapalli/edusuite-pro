import { createFileRoute } from "@tanstack/react-router";
import { HostelModuleView } from "@/modules/hostel";

export const Route = createFileRoute("/hostel/room-allocation")({
  head: () => ({ meta: [{ title: "Hostel Room Allocation — EduSuite Pro" }] }),
  component: () => <HostelModuleView />,
});
