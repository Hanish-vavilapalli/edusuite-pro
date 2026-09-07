import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/room")({
  head: () => ({
    meta: [{ title: "My Room Allocation — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="room" />,
});
