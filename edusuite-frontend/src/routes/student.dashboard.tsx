import { createFileRoute } from "@tanstack/react-router";
import { PersonalizedStudentPortal } from "@/modules/student-portal/PersonalizedStudentPortal";

export const Route = createFileRoute("/student/dashboard")({
  head: () => ({
    meta: [
      { title: "Personalized Student Portal — CampusStay Hostel" },
      {
        name: "description",
        content: "Personalized student dashboard for room allocation, mess tokens, outing requests, and biometric gate tracking.",
      },
    ],
  }),
  component: StudentDashboardRoute,
});

function StudentDashboardRoute() {
  return <PersonalizedStudentPortal initialTab="dashboard" />;
}
