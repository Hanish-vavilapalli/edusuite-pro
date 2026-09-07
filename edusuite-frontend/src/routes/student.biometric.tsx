import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/biometric")({
  head: () => ({
    meta: [{ title: "Biometric Movement Tracking — Student Portal" }],
  }),
  component: () => <PersonalizedStudentPortal initialTab="biometric" />,
});
