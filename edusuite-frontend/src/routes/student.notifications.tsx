import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/notifications")({
  head: () => ({
    meta: [{ title: "Student Notifications — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="notifications" />,
});
