import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/outings")({
  head: () => ({
    meta: [{ title: "Outing Requests — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="outings" />,
});
