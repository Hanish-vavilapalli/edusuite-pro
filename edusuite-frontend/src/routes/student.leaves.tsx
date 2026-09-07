import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/leaves")({
  head: () => ({
    meta: [{ title: "Leave Applications — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="leaves" />,
});
