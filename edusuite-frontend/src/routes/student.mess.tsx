import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/mess")({
  head: () => ({
    meta: [{ title: "Mess & Food Menu — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="mess" />,
});
