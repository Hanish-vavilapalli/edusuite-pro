import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/complaints")({
  head: () => ({
    meta: [{ title: "Complaints & Maintenance — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="complaints" />,
});
