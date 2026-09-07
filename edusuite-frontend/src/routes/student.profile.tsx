import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/profile")({
  head: () => ({
    meta: [{ title: "My Student Profile — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="profile" />,
});
